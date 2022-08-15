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
             'name': 'Avoid smoking'}])

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
             'instructions': 'It is really bad for your lungs.\r\nConsider jogging.'},
            {'id': 2,
             'name': 'Avoid drinking',
             'instructions': 'At most once a week.'},
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
             'instructions': 'It is really bad for your lungs.\r\nConsider jogging.'},
            {'id': 2,
             'category': 'Lifestyle changes',
             'subcategory': 'Social habits',
             'name': 'Avoid drinking',
             'instructions': 'At most once a week.'},
            ])


    def test_videos(self):
        input = ["## Antibiotics",
                 "Fluconazole // 10mg",
                 "## Antiviral",
                 "Finasteride // 1mg",
                 "### Anti-retroviral",
                 "Amoxicillin // 150 mg",
                 '',
                 '## Lifestyle changes',
                 '* Avoid smoking',
                 'It is really bad for your lungs.',
                 'Consider jogging.',
                 '',
                 '### Social habits',
                 '* Avoid drinking',
                 'At most once a week.',
                 '## Videos',
                 '* How to use the pump for asthma.',
                 'http://www.youtube.com/v=asthma',
                 '* How to use aerocaps?',
                 'http://www.youtube.com/v=aerocaps']
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
            {'id': 4,
             'category': 'Lifestyle changes',
             'name': 'Avoid smoking',
             'instructions': 'It is really bad for your lungs.\r\nConsider jogging.'},
            {'id': 5,
             'category': 'Lifestyle changes',
             'subcategory': 'Social habits',
             'name': 'Avoid drinking',
             'instructions': 'At most once a week.'},
            {'id': 6,
             'category': 'Videos',
             'name': 'How to use the pump for asthma.',
             'instructions': 'http://www.youtube.com/v=asthma',
             'is_link': True},
            {'id': 7,
             'category': 'Videos',
             'name': 'How to use aerocaps?',
             'instructions': 'http://www.youtube.com/v=aerocaps',
             'is_link': True},
            ])

    def test_images(self):
        input = ['## Imagens',
                 '* Como tratar agua',
                 'como_tratar_agua.jpeg']
        reader = DrugListReader()
        drugs = reader.process_drugs(input)
        assert_that(drugs).is_equal_to([
            {'id': 1,
             'category': 'Imagens',
             'name': 'Como tratar agua',
             'instructions': 'como_tratar_agua.jpeg',
             'is_image': True}])

