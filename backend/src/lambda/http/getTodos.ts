import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'

//import { getTodosForUser as getTodosForUser } from '../../businessLogic/todos'
import { getTodos } from '../../businessLogic/todos'
import { createLogger } from '../../utils/logger'

//import { getUserId } from '../utils';

// TODO: Get all TODO items for a current user
const logger = createLogger('getToDos')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    // Write your code here
    logger.info('get todos  event: ${JSON.stringify(event)}')
    const authorization = event.headers.Authorization
    const split = authorization.split(' ')
    const jwtToken = split[1]
    const item = await getTodos(jwtToken)
    logger.info(`Get all TODO items for current user.... ${JSON.stringify(item)}`)
    return {
      statusCode: 200,
      headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true 
        },
      body: JSON.stringify({
        items: item
      })
    }
  }
)
handler.use(
  cors({
    credentials: true
  })
)
