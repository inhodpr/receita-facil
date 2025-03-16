import dataclasses
import datetime
import json
import os
import time
import string
import random

from flask import Flask, make_response, redirect, render_template, request, url_for
from scripts import drug, storage_defs
from wtforms import Form, validators
from wtforms import BooleanField, HiddenField, IntegerField, PasswordField, SelectField, StringField, TextAreaField
from wtforms.widgets import HiddenInput


app = Flask(__name__,
            static_url_path='/admin/static/')
app_storage = storage_defs.Storage()
SESSION = dict()


class LoginForm(Form):
    email = StringField('Email')
    password = PasswordField('Password')


class DrugForm(Form):
    id = IntegerField('Id', [validators.DataRequired()], widget=HiddenInput())
    name = StringField('Name')
    brand = StringField('Brand')
    quantity = StringField('Quantity')
    category = StringField('Category')
    subcategory = StringField('Subcategory')
    categories_v2 = HiddenField('Categories V2')
    instructions = TextAreaField('Instructions')
    instructions_for_doctors = TextAreaField('Instructions for doctors')
    support_icons = HiddenField('Support icons')
    is_image = BooleanField('Is Image?')
    is_link = BooleanField('Is Link?')
    route = SelectField(choices=[
        '',
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


def _parse_form_contents(request) -> (drug.Drug, str):
    form = DrugForm(request.form)
    if not form.validate():
        return None, form.errors
    new_drug = drug.Drug()
    new_drug.id = form.id.data
    new_drug.name = form.name.data
    new_drug.brand = form.brand.data
    new_drug.quantity = form.quantity.data
    new_drug.category = form.category.data
    new_drug.subcategory = form.subcategory.data
    new_drug.instructions = form.instructions.data
    new_drug.instructions_for_doctors = form.instructions_for_doctors.data
    new_drug.support_icons = form.support_icons.data
    new_drug.route = form.route.data
    new_drug.image_url = form.image_url.data
    new_drug.qr_code_url = form.qr_code_url.data
    new_drug.qr_code_subtitle = form.qr_code_subtitle.data
    new_drug.is_image = form.is_image.data
    new_drug.is_link = form.is_link.data
    parsed_categories_v2 = json.loads(form.categories_v2.data)
    new_drug.categories_v2 = [
        drug.Category(c['top_level_group'], c['subgroup'])
        for c in parsed_categories_v2
    ]
    return new_drug, None


@app.route("/admin/drug/edit/<drug_id>", methods=['GET', 'POST'])
def edit_drug(drug_id):
    claims = None
    error_message = None
    try:
        claims = check_auth_token()
    except ValueError as err:
        return redirect('/admin')
    old_drug = app_storage.drugs().find_drug_by_id(drug_id)
    form = DrugForm(data=dataclasses.asdict(old_drug))
    categories_v2 = json.dumps([
        dataclasses.asdict(c) for c in old_drug.categories_v2
    ])
    if request.method == 'GET':
        return render_template(
            "edit_drug.html",
            user_data=claims,
            error_message=error_message,
            form=form,
            categories_v2_json=categories_v2,
        )
    elif request.method == 'POST':
        new_drug, err = _parse_form_contents(request)
        if new_drug:
            app_storage.drugs().update_drug(new_drug)
            return redirect('/admin')
        else:
            return render_template(
                "edit_drug.html",
                user_data=claims,
                form=form,
                categories_v2_json=categories_v2,
                error_message=error_message + err,
            )

@app.route("/admin/drug/add", methods=['GET', 'POST'])
def add_drug():
    claims = None
    error_message = None
    try:
        claims = check_auth_token()
    except ValueError as err:
        print('auth failed, redirect to home')
        return redirect('/admin')

    # New ids default to nanoseconds since unix epoch.
    id = time.time_ns()
    form=DrugForm(data={'id': id})
    if request.method == 'GET':
        return render_template(
            "edit_drug.html",
            user_data=claims,
            error_message=error_message,
            form=form,
            categories_v2_json='[]',
        )
    elif request.method == 'POST':
        new_drug, err = _parse_form_contents(request)
        if new_drug:
            app_storage.drugs().update_drug(new_drug)
            return redirect('/admin')
        else:
            print(f'error msg: {error_message}')
            return render_template(
                "edit_drug.html",
                user_data=claims,
                form=form,
                categories_v2_json='[]',
                error_message=error_message,
            )


@app.route('/admin/supportIconDefs')
def supportIcons():
    support_icon_defs = app_storage.support_icons().fetch_support_icons_definitions()
    return support_icon_defs


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=8080, debug=True)
