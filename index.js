const express = require('express');
const bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.json({ limit: '10mb' }));

app.post('/transformPayload', (req, res) => {
    let { payload, referenceData: refData } = req.body;
    if (Object.keys(payload).length == 0 || Object.keys(refData).length == 0) {
        return res.status(400).send('invalid payload & refdata')
    }

    try {
        let transformedData = convert(payload, refData)
        res.status(200).send(transformedData)
    } catch (error) {
        console.log("transformation error::", error);
        res.status(500).send('error occured')
    }
});

app.listen(3000, () => console.log(`Server running on port 8012`) );


//custom functions
function convert(payload, referenceData) {
    try {
        return getUpdatedPayload(payload, referenceData);
    } catch (error) {
        console.log("data-transform-error", error)
        throw new Error(error.message)
    }
}

function getUpdatedPayload(payload, referenceData) {
    let { value: payloadVal } = payload;
    payloadVal.forEach(eachVal => {
        (eachVal.valueType == 'string') ? changeValue(eachVal, referenceData) : getUpdatedPayload(eachVal, referenceData);
    });
    return payload;
}

function changeValue(eachObj, referenceData) {
    if (eachObj.value.includes('REF')) {
        let splitArr = eachObj.value.split('{')[1].split('}');
        eachObj.value = referenceData[splitArr[0]] + '' + splitArr[1];
    }
}
