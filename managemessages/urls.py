from rest_framework_extensions.routers import NestedRouterMixin

from rest_framework import routers

from . import views

class NestedDefaultRouter(NestedRouterMixin, routers.DefaultRouter):
    pass

router = NestedDefaultRouter()

chat_routes = router.register("chats", views.ChatViewSet)
chat_routes.register("messages", views.MessageViewSet, basename='chat-messages', parents_query_lookups=["chat"])

app_name = "managemessages"

urlpatterns = router.urls