# How to run BE

1. If you don't have it, install mysql on your computer, XAMPP is the best

2. `cd` your way to `backend` folder

3. Create `.env` file near the `.env.example` and populate it with your connection details. Make sure to create database manually

4. Create virtual env for Python

- (MacOS or Linux) `python3 -m venv .venv`
- (Windows) `python -m venv .venv`

5. Activate it

- (MacOS or Linux) `source .venv/bin/activate`
- (Windows) `.venv\Scripts\activate`

6. Install dependencies

- (MacOS or Linux) `pip3 install -r requirements.txt`
- (Windows) `pip install -r requirements.txt`

7. Populate some dummy data for tests

- `python ./bin/populate.py`

8. Run the app

- `flask --app app run --debug`
