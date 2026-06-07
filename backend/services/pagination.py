from rest_framework.pagination import PageNumberPagination


class ServicePageNumberPagination(PageNumberPagination):
    """UC22 - Cap search results at 20 per page."""
    page_size = 20
    max_page_size = 20
    page_size_query_param = None  # Disable client override