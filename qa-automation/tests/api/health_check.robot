*** Settings ***
Resource         ../../resources/variables/env_vars.robot
Library          ../../libraries/APIClient.py    ${API_BASE_URL}
Force Tags       smoke    api


*** Test Cases ***
Backend Is Reachable
    ${status}    ${body}=    Get    /
    Should Not Be Equal As Integers    ${status}    0

Unknown Endpoint Returns 404 Not 500
    ${status}    ${body}=    Get    /this-route-should-not-exist-xyz
    Should Be Equal As Integers    ${status}    404