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

Get All Texts Returns A List
    ${status}    ${body}=    Get    /api/typing/texts
    Should Be Equal As Integers    ${status}    200
    Should Be True    isinstance($body, list)

Get Random Text Returns A Valid Text Object
    ${status}    ${body}=    Get    /api/typing/texts/random
    Should Be Equal As Integers    ${status}    200
    Dictionary Should Contain Key    ${body}    id
    Dictionary Should Contain Key    ${body}    content
    Dictionary Should Contain Key    ${body}    category
    Should Not Be Empty    ${body}[content]

Get Random Text Filtered By Category Returns Matching Category
    ${status}    ${body}=    Get    /api/typing/texts/random?category=programming
    Should Be Equal As Integers    ${status}    200
    Should Be Equal As Strings    ${body}[category]    programming

Get Categories Returns A List
    ${status}    ${body}=    Get    /api/typing/categories
    Should Be Equal As Integers    ${status}    200
    Should Be True    isinstance($body, list)

Submit Without Payload Returns 400
    ${status}    ${body}=    Post    /api/typing/submit    ${EMPTY}
    Should Be Equal As Integers    ${status}    400
    Dictionary Should Contain Key    ${body}    error

Submit Missing Required Fields Returns 400
    &{payload}=    Create Dictionary    user_id=1
    ${status}    ${body}=    Post    /api/typing/submit    ${payload}
    Should Be Equal As Integers    ${status}    400

Submit With Nonexistent Text Id Returns 404
    &{payload}=    Create Dictionary
    ...    user_id=1
    ...    text_id=999999999
    ...    typed_text=hello world
    ...    time_taken=10
    ${status}    ${body}=    Post    /api/typing/submit    ${payload}
    Should Be Equal As Integers    ${status}    404

Submit With Zero Time Taken Returns 400
    ${status}    ${text_body}=    Get    /api/typing/texts/random
    &{payload}=    Create Dictionary
    ...    user_id=1
    ...    text_id=${text_body}[id]
    ...    typed_text=hello
    ...    time_taken=0
    ${status}    ${body}=    Post    /api/typing/submit    ${payload}
    Should Be Equal As Integers    ${status}    400

Submit A Valid Result Returns Computed Metrics
    ${status}    ${text_body}=    Get    /api/typing/texts/random
    &{payload}=    Create Dictionary
    ...    user_id=1
    ...    text_id=${text_body}[id]
    ...    typed_text=${text_body}[content]
    ...    time_taken=30
    ${status}    ${body}=    Post    /api/typing/submit    ${payload}
    Should Be Equal As Integers    ${status}    201
    Dictionary Should Contain Key    ${body}    metrics
    Dictionary Should Contain Key    ${body}[metrics]    wpm
    Dictionary Should Contain Key    ${body}[metrics]    accuracy
    Dictionary Should Contain Key    ${body}    result_id