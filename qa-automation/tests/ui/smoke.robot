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