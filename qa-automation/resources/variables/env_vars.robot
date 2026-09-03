*** Settings ***
Documentation     Central Place for environment-driven config.
Library           OperatingSystem

*** Variables ***
${BASE_URL}         %{BASE_URL=http://localhost:5173}
${API_BASE_URL}     %{API_BASE_URL=http://localhost:5000/api}
${BROWSER}          %{BROWSER=chrome}
${HEADLESS}         %{HEADLESS=true}
${DEFAULT_TIMEOUT}     %{DEFAULT_TIMEOUT=10s}