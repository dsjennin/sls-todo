import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'
//import { createAttachmentPresignedUrl } from '../../businessLogic/todos'
import { createLogger } from '../../utils/logger'
import * as uuid from 'uuid'
import {updateUrl } from '../../businessLogic/todos'
import * as AWSXRay from 'aws-xray-sdk'
import * as AWS from 'aws-sdk'
//import { getUserId } from '../utils'
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
    logger.info('generateUrl event creation = ${event} ' )
    
    const imaId = uuid.v4()
    
   // console.log ('=====>  auth header = ' + JSON.stringify(event))
   // const userId = getUserId(event)
    //const userId = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IlFjX2x4ZVNNUTRsRVRSUDN6endKSyJ9.eyJpc3MiOiJodHRwczovL2JpbnRlY2gtZGV2LnVzLmF1dGgwLmNvbS8iLCJzdWIiOiJhdXRoMHw2MTZlMDA0MzAyYjNkZDAwNzFjYjFhM2MiLCJhdWQiOiJoVFVTWmlqdVJoRjJtU1ljb2RxbkJUNnZLblBOSkt1TiIsImlhdCI6MTYzODc1MDI0NiwiZXhwIjoxNjM4Nzg2MjQ2LCJhdF9oYXNoIjoiVy1SYjhHeklUallQQ3pTSGZKbFVNUSIsIm5vbmNlIjoiWDE4cVZBOG4wdWhUalhKQX5TM0VmcjBGUXk5clVEcXQifQ.mPD7KGbDT_DFXJpJlLnKK7-XrXkDUsywskvHnlRZPOoQ_JbKwxdpFVl2yWjXR8WmT3ESSPC0LGJNXaLAhS35sZOOxxWYnN0VubcuYnCmY9vIK6m-xjxK-dOx4ijlyFV6cfrMGOA391XtpBth2OTTUfpz8QBb_GLMsEs_aJgV65IGtgu5tDqFjLjuaYgjlqqwxxFHJMwrt5IFj1631qqn6nSQiWlkeLGCjGjO2Ojdy87-YPWz1SE7hb4DY4HUlwi1FfytT_9x6x8NzZLNT0LlEr7vx9X_O8kLB1UYwjOfDSrOgqhJFzHS4T-tIl6bBT6CSOf7w1Ij2KpmBKLCiI_u_A'       
    //console.log('=====> userId= ' + userId)



    //const split = authorization.split(' ')
    //
    
    
    //const jwtToken = split[1]


  //  logger.info(`getting token = ${userId} `);


    
  
    const imUrl = `https://${toStore}.s3.amazonaws.com/${imaId}`
    updateUrl(
        todoId, imUrl
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
      Expires:parseInt(expire) 
    })
  }
