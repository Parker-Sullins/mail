from django import forms
from . models import Email


class ComposeForm(forms.ModelForm):
    class Meta:
        model = Email
        fields = ('')
