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
    Customers can view products.
    Only admins can create, update, or delete products.
    """

    def has_permission(self, request, view):

        # User must be authenticated
        if not request.user or not request.user.is_authenticated:
            return False

        # Read operations are allowed for customers and admins
        if request.method in ["GET", "HEAD", "OPTIONS"]:
            return True

        # Write operations are allowed only for admins
        return request.user.is_staff

class CategoryPermission(BasePermission):
    """
    Customers can view categories.
    Only admins can create, update, or delete categories.
    """

    def has_permission(self, request, view):

        # User must be authenticated
        if not request.user or not request.user.is_authenticated:
            return False

        # Read operations are allowed for customers and admins
        if request.method in ["GET", "HEAD", "OPTIONS"]:
            return True

        # Write operations are allowed only for admins
        return request.user.is_staff