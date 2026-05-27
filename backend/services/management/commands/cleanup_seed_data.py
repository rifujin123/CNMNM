from django.core.management.base import BaseCommand
from django.db.models import Q

from services.models import BaseService, Hotel, Transport, TravelTour


class Command(BaseCommand):
    help = "Find and delete old/broken seed service data. Dry-run by default."

    def add_arguments(self, parser):
        parser.add_argument(
            "--execute",
            action="store_true",
            help="Actually delete records. Without this flag, only preview.",
        )
        parser.add_argument(
            "--all",
            action="store_true",
            help="Check all services. Default only checks names starting with 'Seed '.",
        )

    def handle(self, *args, **options):
        execute = options["execute"]
        check_all = options["all"]

        mode = "DELETE" if execute else "DRY RUN"
        scope = "all services" if check_all else "seed services only"
        self.stdout.write(self.style.WARNING(f"=== {mode}: {scope} ==="))

        broken = []

        self.add_broken_base_services(broken, check_all)
        self.add_broken_tours(broken, check_all)
        self.add_broken_hotels(broken, check_all)
        self.add_broken_transports(broken, check_all)

        broken = self.unique_records(broken)

        if not broken:
            self.stdout.write(self.style.SUCCESS("No broken records found."))
            return

        self.stdout.write(f"Found {len(broken)} broken record(s):")
        for obj, reason in broken:
            name = getattr(obj, "name", "")
            self.stdout.write(f"- {obj.__class__.__name__} id={obj.id} name='{name}' -> {reason}")

        if not execute:
            self.stdout.write(self.style.WARNING("Preview only. Add --execute to delete."))
            return

        deleted = 0
        for obj, reason in broken:
            name = getattr(obj, "name", "")
            self.stdout.write(f"Deleting {obj.__class__.__name__} id={obj.id} name='{name}' ({reason})")
            obj.delete()
            deleted += 1

        self.stdout.write(self.style.SUCCESS(f"Deleted {deleted} broken record(s)."))

    def seed_filter(self, qs, check_all):
        if check_all:
            return qs
        return qs.filter(name__startswith="Seed ")

    def add_broken_base_services(self, broken, check_all):
        qs = self.seed_filter(BaseService.objects.all(), check_all)

        checks = [
            (Q(provider__isnull=True), "provider missing"),
            (Q(category__isnull=True), "category missing"),
            (Q(city__isnull=True), "city missing"),
            (Q(name__isnull=True) | Q(name=""), "name missing"),
            (Q(description__isnull=True) | Q(description=""), "description missing"),
            (Q(base_price__isnull=True), "base_price missing"),
        ]

        for query, reason in checks:
            for obj in qs.filter(query):
                broken.append((obj, reason))

    def add_broken_tours(self, broken, check_all):
        qs = self.seed_filter(TravelTour.objects.all(), check_all)

        checks = [
            (Q(time_start__isnull=True), "time_start missing"),
            (Q(empty_slot__isnull=True), "empty_slot missing"),
        ]

        for query, reason in checks:
            for obj in qs.filter(query):
                broken.append((obj, reason))

    def add_broken_hotels(self, broken, check_all):
        # Hotel has no extra required cleanup field for now.
        return

    def add_broken_transports(self, broken, check_all):
        qs = self.seed_filter(Transport.objects.all(), check_all)

        checks = [
            (Q(brand_name__isnull=True) | Q(brand_name=""), "brand_name missing"),
        ]

        for query, reason in checks:
            for obj in qs.filter(query):
                broken.append((obj, reason))

    def unique_records(self, broken):
        seen = set()
        unique = []

        for obj, reason in broken:
            key = (obj.__class__.__name__, obj.id)
            if key in seen:
                continue
            seen.add(key)
            unique.append((obj, reason))

        return unique
