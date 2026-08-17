from rest_framework.permissions import BasePermission


class IsAdminUser(BasePermission):
    """
    Allows access only to authenticated admin users.
    """

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.is_staff
        )


class ProductPermission(BasePermission):
    """
    Anyone can view products.
    Only authenticated admins can create, update, or delete products.
    """

    def has_permission(self, request, view):

        # Public read access
        if request.method in ["GET", "HEAD", "OPTIONS"]:
            return True

        # Write operations require an authenticated admin
        return (
            request.user
            and request.user.is_authenticated
            and request.user.is_staff
        )


class CategoryPermission(BasePermission):
    """
    Anyone can view categories.
    Only authenticated admins can create, update, or delete categories.
    """

    def has_permission(self, request, view):

        # Public read access
        if request.method in ["GET", "HEAD", "OPTIONS"]:
            return True

        # Write operations require an authenticated admin
        return (
            request.user
            and request.user.is_authenticated
            and request.user.is_staff
        )