# Generated manually for one comment per user per tour

from django.db import migrations, models


def delete_duplicate_comments(apps, schema_editor):
    Comment = apps.get_model('services', 'Comment')
    seen = set()
    duplicate_ids = []

    for comment in Comment.objects.order_by('-id'):
        key = (comment.user_id, comment.travel_tour_id)
        if key in seen:
            duplicate_ids.append(comment.id)
        else:
            seen.add(key)

    if duplicate_ids:
        Comment.objects.filter(id__in=duplicate_ids).delete()


class Migration(migrations.Migration):

    dependencies = [
        ('services', '0018_comment_rating'),
    ]

    operations = [
        migrations.RunPython(delete_duplicate_comments, migrations.RunPython.noop),
        migrations.AddConstraint(
            model_name='comment',
            constraint=models.UniqueConstraint(
                fields=('user', 'travel_tour'),
                name='uniq_comment_user_travel_tour',
            ),
        ),
    ]
