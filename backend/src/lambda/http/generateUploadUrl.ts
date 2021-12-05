import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'
//import { createAttachmentPresignedUrl } from '../../businessLogic/todos'
//import { getUserId } from '../utils'
import { createLogger } from '../../utils/logger'
import * as uuid from 'uuid'
import {updateUrl } from '../../businessLogic/todos'
import * as AWSXRay from 'aws-xray-sdk'
import * as AWS from 'aws-sdk'
const XAWS = AWSXRay.captureAWS(AWS)
const siv = new XAWS.S3({
  signatureVersion: 'v4'
})

const logger = createLogger('generateUploadUrl')
const toStore = process.env.IMAGES_BUCKET
const expire = process.env.SIGNED_URL_EXPIRATION



export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId
    // TODO: Return a presigned URL to upload a file for a TODO item with the provided id
  
    const imaId = uuid.v4()
    const authorization = event.headers.Authorization
    const split = authorization.split(' ')
    const jwtToken = split[1]
  
    const imUrl = `https://${toStore}.s3.amazonaws.com/${imaId}`
    updateUrl(
        todoId, imUrl,
        jwtToken
    )
    const uploadUrl = getUploadUrl(imaId)

    logger.info(`Genreate Upload Url:  ${JSON.stringify(uploadUrl)}`)
    return {
      statusCode: 200,
      body: JSON.stringify({
        uploadUrl
      })
     }
  }
)

handler
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )

  function getUploadUrl(imaId: string) {
    return siv.getSignedUrl('putObject', {
      Bucket: toStore,
      Key: imaId,
      Expires:parseInt(expire) 
    })
  }
