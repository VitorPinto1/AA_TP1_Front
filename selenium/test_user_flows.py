import time
from datetime import datetime, timedelta

import pytest
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException


STEP_DELAY = 1.5 # Délai entre les étapes du test en secondes

def wait_for_text(driver, text, timeout=10):
  # Attente que le texte soit présent dans la page.
  WebDriverWait(driver, timeout).until(
    EC.presence_of_element_located((By.XPATH, f"//*[contains(normalize-space(.), '{text}')]"))
  )

def logout_if_needed(driver, base_url):
  # Déconnexion si nécessaire.
      driver.get(f"{base_url}/user")
      try:
          logout_btn = WebDriverWait(driver, 3).until(
              EC.element_to_be_clickable((By.XPATH, "//button[contains(., 'Se déconnecter')]"))
          )
          logout_btn.click()
      except TimeoutException:
          pass
      driver.delete_all_cookies()
      try:
          driver.execute_script("window.localStorage.clear(); window.sessionStorage.clear();")
      except Exception:
          pass

def login_as(driver, base_url, email, password):
    # Test connexion avec les identifiants donnés.
    logout_if_needed(driver, base_url)
    driver.get(f"{base_url}/user")
    time.sleep(STEP_DELAY)

    login_btn = WebDriverWait(driver, 10).until(
      EC.element_to_be_clickable((By.XPATH, "//button[contains(., 'Se connecter')]"))
    )
    login_btn.click()
    time.sleep(STEP_DELAY)

    WebDriverWait(driver, 10).until(EC.visibility_of_element_located((By.ID, "email")))
    driver.find_element(By.ID, "email").send_keys(email)
    driver.find_element(By.ID, "password").send_keys(password)
    time.sleep(STEP_DELAY)

    driver.find_element(By.CSS_SELECTOR, "button[type='submit']").click()


# ═══════════════════════════════════════════════════════════════════
#  BLOC USER – Tests du point de vue d'un utilisateur client
# ═══════════════════════════════════════════════════════════════════

class TestUser:

    def test_create_account(self, driver, base_url):
        # Création d'un compte valide.
        driver.get(f"{base_url}/user")
        time.sleep(STEP_DELAY)

        create_btn = WebDriverWait(driver, 10).until(
          EC.element_to_be_clickable((By.XPATH, "//button[contains(., 'Créer un compte')]"))
        )
        create_btn.click()
        time.sleep(STEP_DELAY)

        # Email unique pour éviter les collisions
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        email = f"selenium+{timestamp}@billetterie.com"

        driver.find_element(By.ID, "nom").send_keys("Test")
        driver.find_element(By.ID, "prenom").send_keys("Selenium")
        driver.find_element(By.ID, "email").send_keys(email)
        driver.find_element(By.ID, "password").send_keys("TestTest123!")
        driver.find_element(By.ID, "phone").send_keys("0612345678")
        time.sleep(STEP_DELAY)

        driver.find_element(By.CSS_SELECTOR, "button[type='submit']").click()

        wait_for_text(driver, "Se connecter")
        time.sleep(STEP_DELAY)

    def test_login_wrong_password(self, driver, base_url):
        # Test connexion avec un mauvais mot de passe .
        login_as(driver, base_url, "test@billetterie.com", "MauvaisMotDePasse99!")
        time.sleep(STEP_DELAY)

        # On doit rester sur la page login avec un message d'erreur
        WebDriverWait(driver, 10).until(
          EC.presence_of_element_located((By.CSS_SELECTOR, ".error-message"))
        )
        error_msg = driver.find_element(By.CSS_SELECTOR, ".error-message")
        assert error_msg.is_displayed(), "Un message d'erreur devrait apparaître"
        time.sleep(STEP_DELAY)

    def test_create_account_weak_password(self, driver, base_url):
        # Test création de compte avec un mot de passe trop faible (pas de majuscule, pas de caractère spécial).
        logout_if_needed(driver, base_url)
        driver.get(f"{base_url}/user")
        time.sleep(STEP_DELAY)

        create_btn = WebDriverWait(driver, 10).until(
          EC.element_to_be_clickable((By.XPATH, "//button[contains(., 'Créer un compte')]"))
        )
        create_btn.click()
        time.sleep(STEP_DELAY)

        driver.find_element(By.ID, "nom").send_keys("Test")
        driver.find_element(By.ID, "prenom").send_keys("Faible")
        driver.find_element(By.ID, "email").send_keys("faible@billetterie.com")
        driver.find_element(By.ID, "password").send_keys("abc")
        time.sleep(STEP_DELAY)

        driver.find_element(By.CSS_SELECTOR, "button[type='submit']").click()
        time.sleep(STEP_DELAY)

        wait_for_text(driver, "ne respecte pas les critères")
        time.sleep(STEP_DELAY)

    def test_reservation_flow(self, driver, base_url):
        # Test utilisateur client réserve un spectacle existant.
        login_as(driver, base_url, "test@billetterie.com", "TestTest123!")

        wait_for_text(driver, "Mon Compte")
        time.sleep(STEP_DELAY)

        driver.get(f"{base_url}/programmation")

        WebDriverWait(driver, 10).until(
          EC.presence_of_element_located((By.CSS_SELECTOR, ".spectacle-card"))
        )
        time.sleep(STEP_DELAY)

        reserve_btn = driver.find_element(By.XPATH, "//button[contains(., 'Réserver')]")
        reserve_btn.click()
        time.sleep(STEP_DELAY)

        select_elem = WebDriverWait(driver, 10).until(
          EC.presence_of_element_located((By.CSS_SELECTOR, ".modal select"))
        )

        options = select_elem.find_elements(By.TAG_NAME, "option")
        if len(options) > 1:
          options[1].click()

        qty_input = driver.find_element(By.CSS_SELECTOR, ".modal input[type='number']")
        qty_input.clear()
        qty_input.send_keys("1")
        time.sleep(STEP_DELAY)

        confirm_btn = driver.find_element(By.XPATH, "//button[contains(., 'Confirmer la réservation')]")
        confirm_btn.click()

        WebDriverWait(driver, 10).until(EC.url_contains("/payment"))
        wait_for_text(driver, "Informations de paiement")
        time.sleep(STEP_DELAY)

    def test_access_creation_forbidden(self, driver, base_url):
        # Test un user client ne doir pas accéder à la page de création.
        login_as(driver, base_url, "test@billetterie.com", "TestTest123!")
        wait_for_text(driver, "Mon Compte")
        time.sleep(STEP_DELAY)

        driver.get(f"{base_url}/creation")
        time.sleep(STEP_DELAY)

        current_url = driver.current_url
        assert "/creation" not in current_url or driver.find_elements(By.ID, "name") == [], \
            "Un utilisateur client ne devrait pas accéder à la page de création"
        time.sleep(STEP_DELAY)

    def test_access_dashboard_forbidden(self, driver, base_url):
        # Test un user client ne doir pas accéder à la page de dashboard.
        login_as(driver, base_url, "test@billetterie.com", "TestTest123!")
        wait_for_text(driver, "Mon Compte")
        time.sleep(STEP_DELAY)

        driver.get(f"{base_url}/dashboard")
        time.sleep(STEP_DELAY)

        WebDriverWait(driver, 5).until(
          lambda d: "/dashboard" not in d.current_url
        )
        assert "/dashboard" not in driver.current_url, \
            "Un utilisateur client ne devrait pas rester sur le dashboard"
        time.sleep(STEP_DELAY)

    def test_logout(self, driver, base_url):
        # Test un user connecté clique sur Se déconnecter .
        login_as(driver, base_url, "test@billetterie.com", "TestTest123!")
        wait_for_text(driver, "Mon Compte")
        time.sleep(STEP_DELAY)

        logout_btn = driver.find_element(By.XPATH, "//button[contains(., 'Se déconnecter')]")
        logout_btn.click()
        time.sleep(STEP_DELAY)

        # Après déconnexion, redirigé vers / (accueil)
        WebDriverWait(driver, 5).until(
          lambda d: d.current_url.rstrip('/').endswith(':3000') or d.current_url.endswith('/')
        )

        # Retourner sur /user : on doit voir le menu (Se connecter / Créer un compte)
        driver.get(f"{base_url}/user")
        time.sleep(STEP_DELAY)
        wait_for_text(driver, "Se connecter")
        wait_for_text(driver, "Créer un compte")
        time.sleep(STEP_DELAY)


# ═══════════════════════════════════════════════════════════════════
#  BLOC ADMIN – Tests du point de vue d'un administrateur
# ═══════════════════════════════════════════════════════════════════

class TestAdmin:

    def test_login_wrong_password(self, driver, base_url):
        # Test connexion admin avec un mauvais mot de passe .
        login_as(driver, base_url, "admin@billetterie.com", "PasBonMDP999!")
        time.sleep(STEP_DELAY)

        WebDriverWait(driver, 10).until(
          EC.presence_of_element_located((By.CSS_SELECTOR, ".error-message"))
        )
        error_msg = driver.find_element(By.CSS_SELECTOR, ".error-message")
        assert error_msg.is_displayed(), "Un message d'erreur devrait apparaître"
        time.sleep(STEP_DELAY)

 

    def _create_spectacle_helper(self, driver, base_url, prefix):
        # Helper : crée un spectacle avec le préfixe donné (EDIT ou DELETE).
        login_as(driver, base_url, "admin@billetterie.com", "TestAdmin123!")

        wait_for_text(driver, "Mon Compte")
        time.sleep(STEP_DELAY)

        creation_link = WebDriverWait(driver, 10).until(
          EC.element_to_be_clickable((By.XPATH, "//a[contains(@href, '/creation')]"))
        )
        creation_link.click()
        time.sleep(STEP_DELAY)

        WebDriverWait(driver, 10).until(EC.visibility_of_element_located((By.ID, "name")))

        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        name = f"{prefix} Selenium {timestamp}"

        driver.find_element(By.ID, "name").send_keys(name)
        driver.find_element(By.ID, "description").send_keys("Spectacle créé par test Selenium.")
        driver.find_element(By.ID, "duration").clear()
        driver.find_element(By.ID, "duration").send_keys("120")
        time.sleep(STEP_DELAY)

        category_select = driver.find_element(By.ID, "category")
        category_select.click()
        option = category_select.find_element(By.XPATH, ".//option[@value='Theatre']")
        option.click()
        time.sleep(STEP_DELAY)

        future_dt = datetime(2026, 6, 20, 20, 0)
        dt_str = future_dt.strftime("%Y-%m-%dT%H:%M")

        date_input = driver.find_element(By.CSS_SELECTOR, "input[type='datetime-local']")
        driver.execute_script("""
          var nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
          nativeSetter.call(arguments[0], arguments[1]);
          arguments[0].dispatchEvent(new Event('input', { bubbles: true }));
        """, date_input, dt_str)

        capacity_input = driver.find_element(By.XPATH, "//label[contains(., 'Capacité')]/following-sibling::input")
        capacity_input.clear()
        capacity_input.send_keys("100")

        price_input = driver.find_element(By.XPATH, "//label[contains(., 'Prix unitaire')]/following-sibling::input")
        price_input.clear()
        price_input.send_keys("35.00")
        time.sleep(STEP_DELAY)

        driver.find_element(By.CSS_SELECTOR, "button[type='submit']").click()

        wait_for_text(driver, "Spectacle et représentations créés avec succès")
        time.sleep(STEP_DELAY)

    def test_create_spectacle_for_edit(self, driver, base_url):
        # Test admin crée un spectacle nommé EDIT pour le test de modification.
        self._create_spectacle_helper(driver, base_url, "EDIT")

    def test_create_spectacle_for_delete(self, driver, base_url):
        # Test admin crée un spectacle nommé DELETE pour le test de suppression.
        self._create_spectacle_helper(driver, base_url, "DELETE")

    def test_edit_spectacle(self, driver, base_url):
        # Test admin modification d'un spectacle.
        login_as(driver, base_url, "admin@billetterie.com", "TestAdmin123!")
        wait_for_text(driver, "Mon Compte")
        time.sleep(STEP_DELAY)

        driver.get(f"{base_url}/programmation")
        WebDriverWait(driver, 10).until(
          EC.presence_of_element_located((By.CSS_SELECTOR, ".spectacle-card"))
        )
        time.sleep(STEP_DELAY)

        edit_card = driver.find_element(
          By.XPATH, "//div[contains(@class,'spectacle-card')][.//h3[contains(.,'EDIT')]]"
        )
        edit_btn = edit_card.find_element(By.XPATH, ".//button[contains(., 'Modifier')]")
        edit_btn.click()
        time.sleep(STEP_DELAY)

        WebDriverWait(driver, 10).until(EC.visibility_of_element_located((By.ID, "name")))

        desc_field = driver.find_element(By.ID, "description")
        desc_field.clear()
        desc_field.send_keys("Description modifiée par Selenium.")
        time.sleep(STEP_DELAY)

        driver.find_element(By.CSS_SELECTOR, "button[type='submit']").click()

        wait_for_text(driver, "modifiés avec succès")
        time.sleep(STEP_DELAY)

    def test_admin_cannot_reserve(self, driver, base_url):
        # Test un admin ne doit pas voir le bouton Réserver sur la page de programmation.
        login_as(driver, base_url, "admin@billetterie.com", "TestAdmin123!")
        wait_for_text(driver, "Mon Compte")
        time.sleep(STEP_DELAY)

        driver.get(f"{base_url}/programmation")
        WebDriverWait(driver, 10).until(
          EC.presence_of_element_located((By.CSS_SELECTOR, ".spectacle-card"))
        )
        time.sleep(STEP_DELAY)

        reserve_buttons = driver.find_elements(By.XPATH, "//button[contains(., 'Réserver')]")
        assert len(reserve_buttons) == 0, \
            "Un admin ne devrait pas avoir de bouton 'Réserver'"

        modify_buttons = driver.find_elements(By.XPATH, "//button[contains(., 'Modifier')]")
        assert len(modify_buttons) > 0, \
            "Un admin devrait voir le bouton 'Modifier'"
        time.sleep(STEP_DELAY)

    def test_delete_spectacle(self, driver, base_url):
        # Test admin supprime le spectacle contenant 'DELETE' créé précédemment.
        login_as(driver, base_url, "admin@billetterie.com", "TestAdmin123!")
        wait_for_text(driver, "Mon Compte")
        time.sleep(STEP_DELAY)

        driver.get(f"{base_url}/programmation")
        WebDriverWait(driver, 10).until(
          EC.presence_of_element_located((By.CSS_SELECTOR, ".spectacle-card"))
        )
        time.sleep(STEP_DELAY)

        delete_card = driver.find_element(
          By.XPATH, "//div[contains(@class,'spectacle-card')][.//h3[contains(.,'DELETE')]]"
        )
        edit_btn = delete_card.find_element(By.XPATH, ".//button[contains(., 'Modifier')]")
        edit_btn.click()
        time.sleep(STEP_DELAY)

        WebDriverWait(driver, 10).until(EC.visibility_of_element_located((By.ID, "name")))
        time.sleep(STEP_DELAY)

        driver.execute_script("window.confirm = function() { return true; }")
        delete_btn = driver.find_element(By.XPATH, "//button[contains(., 'Supprimer le spectacle')]")
        delete_btn.click()

        wait_for_text(driver, "Spectacle supprimé avec succès")
        time.sleep(STEP_DELAY)
