const fs = require('fs');
const { S3 } = require('aws-sdk');
const { canBeConvertedToPDF, convertTo } = require('@shelf/aws-lambda-libreoffice')
const PizZip = require('pizzip');
const Docxtemplater = require('docxtemplater');

const S3client = new S3({
    accessKeyId: 'Q3AM3UQ867SPQQA43P2F',
    secretAccessKey: 'zuf+tfteSlswRu7BJ86wekitnifILbZam1KYY3TG',
    endpoint: 'play.min.io',
    s3ForcePathStyle: true,
    signatureVersion: 'v4',
    correctClockSkew: true
});

exports.lambdaHandler = async (event, context) => {
    try {
        const { username, bucket, key } = JSON.parse(event.body);

        const filename = key.substring(key.lastIndexOf('/') + 1);

        //read file
        const content = await fs.promises.readFile(key, { encoding: 'binary' });

        //zip the content
        const zip = new PizZip(content);

        // fill the file
        const doc = new Docxtemplater(zip, {
            delimiters: {
                start: '{{',
                end: '}}',
            },
            paragraphLoop: true,
            linebreaks: true,
        });

        doc.render({
            username,
        });

        const buf = doc.getZip().generate({
            type: 'nodebuffer',
            compression: 'DEFLATE',
        });

        // save file in storage
        await new Promise((resolve, reject) => {
            const config = {
                Key: filename,
                Bucket: bucket,
                Body: buf
            }
            S3client.putObject(config, function(err) {
                if(err) return reject(err);
                console.log('File uploaded successfully.');
                resolve();
            });
        });


        await new Promise((resolve, reject) => {
            const config = {
                Key: filename,
                Bucket: bucket,
            }
            S3client.getObject(config,  async function (err, data) {
                if (err) return reject(err);
                await fs.promises.writeFile('/tmp/output.docx', data.Body);
                console.log('File downloaded successfully.');
                resolve();
            });
        });


        if (!canBeConvertedToPDF('output.docx')) {
            console.log('File cant be converted')
            return {
                'statusCode': 400,
                'body': JSON.stringify({
                    message: 'File cannot be converted to PDF!'
                })
            };
        }

        // convert & return
        await convertTo('output.docx', 'pdf')

        const filledPdfFile = await fs.promises.readFile('/tmp/output.pdf');

        await new Promise((resolve, reject) => {
            const config = {
                Key: 'output.pdf',
                Bucket: bucket,
                Body: filledPdfFile,
            }
            S3client.putObject(config, function(err) {
                if(err) return reject(err);
                console.log('File uploaded successfully.');
                resolve();
            });
        });
        return  {
            'statusCode': 200,
            'body': JSON.stringify({
                message: 'File converted & saved successfully!'
            })
        }
    } catch (err) {
        console.log(err);
        return err;
    }
};
