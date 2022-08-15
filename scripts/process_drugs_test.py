from pyassert import *
from process_drugs import *

class TestProcessDrugs:
    def test_one_drug_with_category(self):
        input = ["## Antibiotics",
                 "Fluconazole // 10mg"]
        reader = DrugListReader()
        drugs = reader.process_drugs(input)
        assert_that(drugs).is_equal_to([
            {'id': 1,
             'category': 'Antibiotics',
             'name': 'Fluconazole',
             'quantity': '10mg'}])

    def test_two_drugs_with_one_category(self):
        input = ["## Antibiotics",
                 "Fluconazole // 10mg",
                 "Finasteride // 1mg"]
        reader = DrugListReader()
        drugs = reader.process_drugs(input)
        assert_that(drugs).is_equal_to([
            {'id': 1,
             'category': 'Antibiotics',
             'name': 'Fluconazole',
             'quantity': '10mg'},
            {'id': 2,
             'category': 'Antibiotics',
             'name': 'Finasteride',
             'quantity': '1mg'},
            ])

    def test_two_drugs_with_two_categories(self):
        input = ["## Antibiotics",
                 "Fluconazole // 10mg",
                 "## Antiviral",
                 "Finasteride // 1mg"]
        reader = DrugListReader()
        drugs = reader.process_drugs(input)
        assert_that(drugs).is_equal_to([
            {'id': 1,
             'category': 'Antibiotics',
             'name': 'Fluconazole',
             'quantity': '10mg'},
            {'id': 2,
             'category': 'Antiviral',
             'name': 'Finasteride',
             'quantity': '1mg'},
            ])

    def test_three_drugs_with_two_categories_one_subcategory(self):
        input = ["## Antibiotics",
                 "Fluconazole // 10mg",
                 "## Antiviral",
                 "Finasteride // 1mg",
                 "### Anti-retroviral",
                 "Amoxicillin // 150 mg",
                 ]
        reader = DrugListReader()
        drugs = reader.process_drugs(input)
        assert_that(drugs).is_equal_to([
            {'id': 1,
             'category': 'Antibiotics',
             'name': 'Fluconazole',
             'quantity': '10mg'},
            {'id': 2,
             'category': 'Antiviral',
             'name': 'Finasteride',
             'quantity': '1mg'},
            {'id': 3,
             'category': 'Antiviral',
             'subcategory': 'Anti-retroviral',
             'name': 'Amoxicillin',
             'quantity': '150 mg'},
            ])

    def test_drug_with_instructions(self):
        input = ['Amoxicillin // 10mg // Intra-venous']
        reader = DrugListReader()
        drugs = reader.process_drugs(input)
        assert_that(drugs).is_equal_to([
            {'id': 1,
             'name': 'Amoxicillin',
             'quantity': '10mg',
             'instructions': 'Intra-venous'}])


    def test_drug_with_instructions_and_brand(self):
        input = ['Amoxicillin // 10mg // Intra-venous // Clavulin BD']
        reader = DrugListReader()
        drugs = reader.process_drugs(input)
        assert_that(drugs).is_equal_to([
            {'id': 1,
             'name': 'Amoxicillin',
             'brand': 'Clavulin BD',
             'quantity': '10mg',
             'instructions': 'Intra-venous'}])


    def test_drug_with_further_instructions(self):
        input = ['Amoxicillin // 10mg // Intra-venous // Clavulin BD',
                 'Take one every day',
                 'Preferrably after lunch']
        reader = DrugListReader()
        drugs = reader.process_drugs(input)
        assert_that(drugs).is_equal_to([
            {'id': 1,
             'name': 'Amoxicillin',
             'brand': 'Clavulin BD',
             'quantity': '10mg',
             'instructions': 'Intra-venous\r\nTake one every day\r\nPreferrably after lunch'}])


    def test_only_recommendation(self):
        input = ['* Avoid smoking']
        reader = DrugListReader()
        drugs = reader.process_drugs(input)
        assert_that(drugs).is_equal_to([
            {'id': 1,
             'name': 'Avoid smoking',
             'instructions': '* Avoid smoking'}])

    def test_multiline_recommendations(self):
        input = ['* Avoid smoking',
                 'It is really bad for your lungs.',
                 'Consider jogging.',
                 '',
                 '* Avoid drinking',
                 'At most once a week.']
        reader = DrugListReader()
        drugs = reader.process_drugs(input)
        assert_that(drugs).is_equal_to([
            {'id': 1,
             'name': 'Avoid smoking',
             'instructions': '* Avoid smoking\r\nIt is really bad for your lungs.\r\nConsider jogging.'},
            {'id': 2,
             'name': 'Avoid drinking',
             'instructions': '* Avoid drinking\r\nAt most once a week.'},
            ])


    def test_recommendations_with_categories(self):
        input = ['## Lifestyle changes',
                 '* Avoid smoking',
                 'It is really bad for your lungs.',
                 'Consider jogging.',
                 '',
                 '### Social habits',
                 '* Avoid drinking',
                 'At most once a week.']
        reader = DrugListReader()
        drugs = reader.process_drugs(input)
        assert_that(drugs).is_equal_to([
            {'id': 1,
             'category': 'Lifestyle changes',
             'name': 'Avoid smoking',
             'instructions': '* Avoid smoking\r\nIt is really bad for your lungs.\r\nConsider jogging.'},
            {'id': 2,
             'category': 'Lifestyle changes',
             'subcategory': 'Social habits',
             'name': 'Avoid drinking',
             'instructions': '* Avoid drinking\r\nAt most once a week.'},
            ])

