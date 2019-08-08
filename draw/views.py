from django.shortcuts import render
from django.utils.safestring import mark_safe
from django.http import JsonResponse
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
	return render(request, "draw/roster.html")

def roster_data(request):
	if request.method == 'POST':
		 if request.POST:
				dancer = Dancer()
				dancer.first_name = request.POST.get('first_name')
				dancer.save()
				
	dancers = Dancer.objects.all();
	dancers_json = {}
	for d in dancers:
		dancers_json[d.id] = {"name": d.first_name, "color": d.color}
	
	return JsonResponse(dancers_json);

def formation_data(request):
	if request.method == 'POST':
		if request.POST:
			f = Formation()
			f.name = request.POST.get('fname')
			print(f)
			
	formations = Formation.objects.all()
	formation_json = {}    #{formation_name:{positons:[(1,2),(3,4)],dancer, color}}
	for f in formations:
		positions = f.positions.all()
		formation_json[f.name] = {"positions":[]}
		formation_json["in_use"] = f.in_use 
		for p in positions:
			formation_json[f.name]["positions"].append([p.x, p.y, p.dancer.first_name, p.dancer.color])
		
	return JsonResponse(formation_json);	
		
	
	