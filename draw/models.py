from django.db import models

# Create your models here.

class Dancer(models.Model):
    first_name = models.CharField("dancer's first name", max_length=30)
    
    def __str__(self):
      return f"{self.id}. {self.first_name}"
    
class Formation(models.Model):
    name = models.CharField("Name of formation", max_length=30, default="custom")
    in_use = models.BooleanField("Currently in use", default=False)
    image = models.TextField("Formation image base64 data", null=True, blank=True)
    notes = models.TextField("Formation notes", null=True, blank=True)
    def __str__(self):
      return f"{self.id}. {self.name}, in use now: {self.in_use}"
    
class Position(models.Model):
    formation = models.ForeignKey(Formation, on_delete=models.CASCADE, related_name="positions") #when formation is deleted delete all positions in the table associted with it
    dancer = models.ForeignKey(Dancer, on_delete=models.SET_NULL, null=True, blank=True, related_name="position") #when dancer is deleted make this field null
    x = models.IntegerField("x-coordinate")
    y = models.IntegerField("y-coordinate")
    color = models.CharField(max_length=30, default="White")
    
    def __str__(self):
      return f"({self.x},{self.y}, {self.color}) in {self.formation.name}"    