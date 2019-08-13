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
	return render(request, "draw/formation.html")

def menu(request):
  return render(request, "draw/menu.html")

def roster(request):
	return render(request, "draw/roster.html")

def roster_data(request):
	if request.method == 'POST':
		if (request.POST.get('action') == 'add'):
			dancer = Dancer()
			dancer.first_name = request.POST.get('first_name')
			dancer.save()
			
		elif (request.POST.get('action') == 'delete'):
			dancer = Dancer.objects.get(first_name__iexact = request.POST.get('first_name'))  #case insensitive
			print(dancer)	
			dancer.delete()
			
	dancers = Dancer.objects.all();
	dancers_json = {}
	for d in dancers:
		dancers_json[d.id] = {"name": d.first_name}
	
	return JsonResponse(dancers_json);

def formation_data(request):
	if request.method == 'POST':
		if (request.POST.get('action') == 'save'):					#save functionality
			if (Formation.objects.filter(name__iexact = request.POST.get('fname')).exists()):
				print("overwriting")
				f = Formation.objects.get(name__iexact = request.POST.get('fname'))
				Position.objects.filter(formation = f).delete()
			else:	
				print("new")
				f = Formation()	
			if (request.POST.get('fname')):
				f.name = request.POST.get('fname')
			if (request.POST.get('notes')):
				f.notes = request.POST.get('notes')
			f.image = request.POST.get('image')	
			pos_array = json.loads(request.POST.get('positions'))
			f.save()
			print(pos_array)
			for pos in pos_array:
				p = Position()
				p.x = pos[0]
				p.y = pos[1]
				p.color = pos[2]
				if (Dancer.objects.filter(first_name__iexact = pos[3]).exists()):
					p.dancer = Dancer.objects.get(first_name__iexact = pos[3])
				p.formation = f
				p.save()
        
		elif (request.POST.get('action') == 'delete'):   #delete functionality
			if (request.POST.get('fname') and Formation.objects.get(name__iexact = request.POST.get('fname'))):
				f = Formation.objects.get(name__iexact = request.POST.get('fname'))
				f.delete()
				
	formations = Formation.objects.all()
	formation_json = {}    #{formation_name:{positons:[(1,2),(3,4)],dancer, color, image}}
	for f in formations:
		positions = f.positions.all()
		formation_json[f.name] = {"positions":[], "in_use":f.in_use, "notes": f.notes, "image":f.image}
		for p in positions:
			if (p.dancer):
				formation_json[f.name]["positions"].append([p.x, p.y, p.dancer.first_name, p.dancer.id , p.color])
			else:
				formation_json[f.name]["positions"].append([p.x, p.y, "", None, p.color])
		
	return JsonResponse(formation_json);	

def saved_formations(request):
	return render(request, "draw/saved_formations.html")
		
	
	