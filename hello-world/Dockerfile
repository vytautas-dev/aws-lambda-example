FROM public.ecr.aws/shelf/lambda-libreoffice-base:7.4-node16-x86_64

COPY app.js package*.json ${LAMBDA_TASK_ROOT}/

COPY input.docx ../../tmp

RUN npm install
# If you are building your code for production, instead include a package-lock.json file on this directory and use:
# RUN npm ci --production

# Command can be overwritten by providing a different command in the template directly.
CMD ["app.lambdaHandler"]
