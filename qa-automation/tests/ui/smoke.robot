*** Settings ***
Documentation    Basic smoke checks that the TypeMaster frontend loads.
Resource         ../../resources/variables/env_vars.robot
Resource         ../../resources/keywords/common_keywords.robot
Suite Setup      Open TypeMaster
Suite Teardown   Close TypeMaster
Force Tags       smoke    ui


*** Test Cases ***
Homepage Loads Successfully
    Location Should Contain    localhost
    ${title}=    Get Title
    Should Not Be Empty    ${title}

Page Body Is Rendered
    ${body_text}=    Get Text    tag:body
    Should Not Be Empty    ${body_text}

Navbar Displays All Expected Nav Items
    ${body_text}=    Get Text    tag:body
    Should Contain    ${body_text}    Test
    Should Contain    ${body_text}    Tutor
    Should Contain    ${body_text}    Game
    Should Contain    ${body_text}    Leaderboard

Navbar Logo Is Visible
    ${body_text}=    Get Text    tag:body
    Should Contain    ${body_text}    TypeMaster

Typing Test Input Is Present On Load
    Wait Until Element Is Visible    css:textarea[aria-label="Typing test input"]    timeout=10s
    Element Should Be Visible    css:textarea[aria-label="Typing test input"]

Duration Options Are Selectable
    ${body_text}=    Get Text    tag:body
    Should Contain    ${body_text}    60s
    Should Contain    ${body_text}    180s
    Should Contain    ${body_text}    300s