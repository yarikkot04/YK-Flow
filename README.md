# YK-Flow

A modern, minimalist personal blog platform built with Python and Django, featuring full internationalization (i18n), automated media management, and production-ready containerization.

## Tech Stack

* **Backend:** Python 3.12, Django (MVT Architecture)
* **Database:** PostgreSQL 15 (Dockerized)
* **WSGI Server:** Gunicorn
* **Static Files:** WhiteNoise
* **Containerization:** Docker, Docker Compose
* **Frontend:** Responsive HTML5, CSS3, Vanilla JavaScript


## Local Setup & Installation

### Prerequisites

Make sure you have [Docker](https://docs.docker.com/get-docker/) and [Docker Compose](https://docs.docker.com/compose/install/) installed on your system.

### Steps to Run

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/yarikkot04/YK-Flow.git
   cd YK-Flow
   ```

2. **Launch Containerized Application:**

    Run Docker Compose to build the application image, pull PostgreSQL, apply database migrations, collect static assets, and start the web serve

    ```bash
    docker-compose up --build
    ```

3. **Create an Administrative Account:**

    While the containers are running, open a new terminal window and run:
    
    ```bash
    docker-compose exec web python manage.py createsuperuser
    ```

4. **Access the Application:**

    Open your browser and navigate to:
    * Web application: http://127.0.0.1:8000
    * Django Admin: http://127.0.0.1:8000/admin/

## Alternative Local Setup (Without Docker)
If you prefer running the project using a local Python virtual environment:

1. **Create and Activate Virtual Environment:**
   ```bash
    python -m venv venv
    source venv/bin/activate  # On Windows use: venv\Scripts\activate
   ```
2. **Install Dependencies:**
   ```bash
    pip install -r requirements.txt
   ```
3. **Compile Language Dictionaries:**
   ```bash
    python manage.py compilemessages
   ```
4. **Run Database Migrations & Start Server:**
   ```bash
    python manage.py migrate
    python manage.py runserver
   ```