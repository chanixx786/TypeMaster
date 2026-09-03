*** Settings ***
Documentation    Shared setup/teardown keywords used across UI test suites.
Library          SeleniumLibrary
Resource         ../variables/env_vars.robot


*** Keywords ***
Open TypeMaster
    [Documentation]    Opens the TypeMaster app in a browser, configured via env vars.
    IF    '${HEADLESS}' == 'true'
        ${options}=    Evaluate    selenium.webdriver.ChromeOptions()    modules=selenium
        Call Method    ${options}    add_argument    --headless=new
        Call Method    ${options}    add_argument    --window-size=1920,1080
        Open Browser    ${BASE_URL}    ${BROWSER}    options=${options}
    ELSE
        Open Browser    ${BASE_URL}    ${BROWSER}
        Maximize Browser Window
    END
    Set Selenium Timeout    ${DEFAULT_TIMEOUT}

Close TypeMaster
    [Documentation]    Closes the browser.
    Close Browser