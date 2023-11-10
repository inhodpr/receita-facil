import datetime

from flask import Flask, redirect, render_template, request, url_for
from google.auth.transport import requests
from google.cloud import datastore
from wtforms import Form, validators
from wtforms import BooleanField, IntegerField, StringField, TextAreaField
import google.oauth2.id_token


firebase_request_adapter = requests.Request()


datastore_client = datastore.Client(project="hellodpiresworld")


app = Flask(__name__)


class DrugForm(Form):
    id = IntegerField('Id', [validators.DataRequired()])
    name = StringField('Name')
    brand = StringField('Brand')
    quantity = StringField('Quantity')
    category = StringField('Category')
    subcategory = StringField('Subcategory')
    instructions = TextAreaField('Instructions')
    instructions_for_doctors = TextAreaField('Instructions for doctors')
    is_image = BooleanField('Is Image?')
    is_link = BooleanField('Is Link?')


def load_all_drugs(limit=3000):
    query = datastore_client.query(kind="drug")
    query.order = ["id"]
    return query.fetch(limit=limit)


def load_drug(drug_id):
    return datastore_client.get(key=datastore_client.key("drug", int(drug_id)))


def check_auth_token():
    # Verify Firebase auth.
    claims = None
    error_message = None
    id_token = request.cookies.get("token")
    if id_token:
        claims = google.oauth2.id_token.verify_firebase_token(
            id_token, firebase_request_adapter)
    else:
        raise ValueError('No token.')
    return claims, error_message


@app.route("/admin")
def root():
    claims = None
    error_message = None
    try:
        claims, error_message = check_auth_token()
    except ValueError as err:
        return render_template(
            "index.html", user_data=None, error_message=error_message, drugs=None)

    drugs = load_all_drugs()
    return render_template(
        "index.html", user_data=claims, error_message=None, drugs=drugs)


@app.route("/admin/drug/edit/<drug_id>", methods=['GET', 'POST'])
def edit_drug(drug_id):
    claims = None
    error_message = None
    try:
        claims, error_message = check_auth_token()
    except ValueError as err:
        return render_template(
            "index.html", user_data=None, error_message=error_message, drugs=None)

    drug = load_drug(drug_id)
    form = DrugForm(data=drug)
    if request.method == 'GET':
        return render_template(
            "edit_drug.html", user_data=claims, error_message=error_message, form=form
        )
    elif request.method == 'POST':
        new_form = DrugForm(request.form)
        if form.validate():
            drug['name'] = new_form.name.data
            drug['brand'] = new_form.brand.data
            drug['quantity'] = new_form.quantity.data
            drug['category'] = new_form.category.data
            drug['subcategory'] = new_form.subcategory.data
            drug['instructions'] = new_form.instructions.data
            drug['instructions_for_doctors'] = new_form.instructions_for_doctors.data
            drug['is_image'] = new_form.is_image.data
            drug['is_link'] = new_form.is_link.data
            datastore_client.put(drug)
            return redirect('/admin')
        else:
            return render_template(
                "edit_drug.html", user_data=claims, error_message=error_message, form=form
            )


if __name__ == "__main__":
    # This is used when running locally only. When deploying to Google App
    # Engine, a webserver process such as Gunicorn will serve the app. This
    # can be configured by adding an `entrypoint` to app.yaml.
    # Flask's development server will automatically serve static files in
    # the "static" directory. See:
    # http://flask.pocoo.org/docs/1.0/quickstart/#static-files. Once deployed,
    # App Engine itself will serve those files as configured in app.yaml.
    app.run(host="127.0.0.1", port=8080, debug=True)
