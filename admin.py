import dataclasses
import datetime
import json
import os
import string
import random

from flask import Flask, make_response, redirect, render_template, request, url_for
from scripts import storage_defs
from wtforms import Form, validators
from wtforms import BooleanField, HiddenField, IntegerField, PasswordField, SelectField, StringField, TextAreaField


app = Flask(__name__,
            static_url_path='/admin/static/')
app_storage = storage_defs.Storage()
SESSION = dict()


class LoginForm(Form):
    email = StringField('Email')
    password = PasswordField('Password')


class DrugForm(Form):
    id = IntegerField('Id', [validators.DataRequired()])
    name = StringField('Name')
    brand = StringField('Brand')
    quantity = StringField('Quantity')
    category = StringField('Category')
    subcategory = StringField('Subcategory')
    instructions = TextAreaField('Instructions')
    instructions_for_doctors = TextAreaField('Instructions for doctors')
    support_icons = HiddenField('Support icons')
    is_image = BooleanField('Is Image?')
    is_link = BooleanField('Is Link?')
    route = SelectField(choices=[
        'Uso oral',
        'Uso oral contínuo',
        'Uso Tópico',
        'Uso Externo',
        'Uso Nasal',
        'Uso Vaginal',
        'Uso Retal',
        'Uso Subcutâneo',
        'Uso Intramuscular',
        'Uso Intravenoso',
        'Uso Oftálmico',
        'Uso Otológico',
        'Uso Inalatório',
        'Nebulização',
        'Declaração',
        'Relatório',
        'Laudo Médico',
        'Orientações',
        'Encaminhamento',
        'Retorno',
        'Atestado',
        'Solicitação de exames',
    ], validate_choice=False)
    image_url = StringField("Image associada à droga (URL)")
    qr_code_url = StringField("QR code associado à droga (URL)")
    qr_code_subtitle = StringField("QR code associado à droga (descrição)")


def check_auth_token():
    claims = None
    error_message = None
    id_token = request.cookies.get("token")
    if id_token and id_token in SESSION:
        claims = SESSION[id_token]
    elif not id_token:
        raise ValueError('missing id token.')
    elif id_token not in SESSION:
        raise ValueError('id token was logged out.')
    else:
        raise ValueError('No token.')
    return claims


@app.route("/admin", methods=['GET', 'POST'])
def root():
    if request.method == 'POST':
        error_message = None
        form = LoginForm(request.form)
        email = form.email.data
        user = app_storage.user().find_user_by_email(email)
        response = make_response(redirect('/admin'))
        if user and user.password == form.password.data:
            valid_chars = (string.ascii_uppercase +
                           string.ascii_lowercase + string.digits)
            token = ''.join(random.choices(valid_chars, k=32))
            response.set_cookie('token', token)
            SESSION[token] = email
        return response
    elif request.method == 'GET':
        claims = None
        try:
            claims = check_auth_token()
        except ValueError as err:
            form = LoginForm()
            return render_template(
                "admin.html", user_data=None, error_message=err, drugs=None, form=form)

        drugs = app_storage.drugs().fetch_drugs()
        return render_template(
            "admin.html",
            user_data=claims,
            error_message=None,
            drugs=drugs,
            form=None)


@app.route("/admin/logout")
def logout():
    response = make_response(redirect('/admin'))
    response.delete_cookie('token')
    return response


@app.route("/admin/drug/edit/<drug_id>", methods=['GET', 'POST'])
def edit_drug(drug_id):
    claims = None
    error_message = None
    try:
        claims = check_auth_token()
    except ValueError as err:
        print('auth failed, redirect to home')
        return redirect('/admin')

    print('auth success')
    drug = app_storage.drugs().find_drug_by_id(drug_id)
    print(f'current drug: {drug}')
    form = DrugForm(data=dataclasses.asdict(drug))
    if request.method == 'GET':
        return render_template(
            "edit_drug.html", user_data=claims, error_message=error_message, form=form
        )
    elif request.method == 'POST':
        print('>>> got post!')
        new_form = DrugForm(request.form)
        if form.validate():
            drug.name = new_form.name.data
            drug.brand = new_form.brand.data
            drug.quantity = new_form.quantity.data
            drug.category = new_form.category.data
            drug.subcategory = new_form.subcategory.data
            drug.instructions = new_form.instructions.data
            drug.instructions_for_doctors = new_form.instructions_for_doctors.data
            drug.support_icons = new_form.support_icons.data
            drug.route = new_form.route.data
            drug.image_url = new_form.image_url.data
            drug.qr_code_url = new_form.qr_code_url.data
            drug.qr_code_subtitle = new_form.qr_code_subtitle.data
            drug.is_image = new_form.is_image.data
            drug.is_link = new_form.is_link.data
            print(f'new drug: {drug}')
            app_storage.drugs().update_drug(drug)
            return redirect('/admin')
        else:
            print(f'error msg: {error_message}')
            return render_template(
                "edit_drug.html", user_data=claims, error_message=error_message, form=form
            )


@app.route('/admin/supportIconDefs')
def supportIcons():
    support_icon_defs = app_storage.support_icons().fetch_support_icons_definitions()
    return support_icon_defs


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=8080, debug=True)
