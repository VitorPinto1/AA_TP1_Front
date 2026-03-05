import os
import pytest
from selenium import webdriver
from selenium.webdriver.chrome.service import Service as ChromeService
from selenium.webdriver.chrome.options import Options as ChromeOptions
from webdriver_manager.chrome import ChromeDriverManager


@pytest.fixture(scope="session")
def base_url():
    """
    URL de base de l'application front.
    Peut être surchargée via la variable d'environnement BASE_URL.
    """
    return os.getenv("BASE_URL", "http://localhost:3000")


@pytest.fixture(scope="session")
def driver():
    """
    Instancie un navigateur Chrome pour l'ensemble de la session de tests.
    """
    options = ChromeOptions()
    # options.add_argument("--headless=new")  # décommente pour exécuter les tests sans fenêtre
    options.add_argument("--window-size=1280,800")

    service = ChromeService(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=options)

    yield driver

    driver.quit()

