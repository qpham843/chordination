from django.shortcuts import render
from django.utils.safestring import mark_safe
import json
from .models import Dancer, Formation, Position

def index(request):
    return render(request, 'draw/index.html', {})

def temp(request):
	return render(request, "draw/temp.html")
  
def formation(request):
	context = {
          "dancers": Dancer.objects.all(),
					"formations": Formation.objects.all(),
					"positions": Position.objects.all()
      }
	return render(request, "draw/formation.html", context)

def menu(request):
  return render(request, "draw/menu.html")

def roster(request):
	context = {
          "dancers": Dancer.objects.all()
      }
	if request.method == 'POST':
		 if request.POST.get('first_name'):
				dancer = Dancer()
				dancer.first_name = request.POST.get('first_name')
				dancer.save()
				
				return render(request, "draw/roster.html", context)
	else:
		return render(request, "draw/roster.html", context)