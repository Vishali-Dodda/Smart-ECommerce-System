from django.urls import path

from .views import (
    OrderCreateView,
    OrderListView,
    OrderDetailView,
    AdminOrderListView,
    AdminOrderDetailView,
    OrderCancelView,
)

urlpatterns = [
    path(
        "",
        OrderListView.as_view(),
        name="order-list"
    ),

    path(
        "create/",
        OrderCreateView.as_view(),
        name="order-create"
    ),

    path(
        "<int:pk>/",
        OrderDetailView.as_view(),
        name="order-detail"
    ),

    path(
        "admin/",
        AdminOrderListView.as_view(),
        name="admin-order-list"
    ),

    path(
        "admin/<int:pk>/",
        AdminOrderDetailView.as_view(),
        name="admin-order-detail"
    ),
    path(
        "<int:pk>/cancel/",
        OrderCancelView.as_view(),
        name="order-cancel"
    ),
]