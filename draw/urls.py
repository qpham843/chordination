# chat/urls.py
from django.conf.urls import url
from django.urls import path

from . import views

urlpatterns = [
    url(r'^$', views.index, name='index'),
    path('temp/', views.temp, name='temp'),
    path('formation/', views.formation, name='formation'),
    path('menu/', views.menu, name='menu'),
    path('roster/', views.roster, name='roster'),
    path('roster_data/', views.roster_data, name='roster_data'),
    path('formation_data/', views.formation_data, name='formation_data'),
    path('saved_formations/', views.saved_formations, name='saved_formations')
]

