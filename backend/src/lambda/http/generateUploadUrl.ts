import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'
//import { createAttachmentPresignedUrl } from '../../businessLogic/todos'
import { createLogger } from '../../utils/logger'
import * as uuid from 'uuid'
import { updateUrl } from '../../businessLogic/todos'
import * as AWSXRay from 'aws-xray-sdk'
import * as AWS from 'aws-sdk'
import { getUserId } from '../utils'
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
    logger.info('generateUrl event creation = ${event} ')

    const imaId = uuid.v4()

    const userId = getUserId(event)
    logger.info(`UPDATE TODO ${userId}`)





    const imUrl = `https://${toStore}.s3.amazonaws.com/${imaId}`
    updateUrl(
      userId, todoId, imUrl
    )
    const uploadUrl = getUploadUrl(imaId)
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
    Expires: parseInt(expire)
  })
}
