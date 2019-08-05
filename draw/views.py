from django.shortcuts import render
from django.utils.safestring import mark_safe
import json

def index(request):
    return render(request, 'draw/index.html', {})

def temp(request):
	return render(request, "draw/temp.html")
  
def formation(request):
  return render(request, "draw/formation.html")

def menu(request):
  return render(request, "draw/menu.html")