import axios from 'axios'
import Syncano from 'syncano-server'

export default (ctx) => {
  const {response} = Syncano(ctx)
  const rootUrl = `https://${ctx.meta.api_host}/v2/instances/${ctx.meta.instance}`

  axios.get(`${rootUrl}/api_keys/?api_key=${ctx.meta.token}`)
    .then(res => {
      const uploadKey = res.data.objects.find(key => key.description === 'Api key for upload files')
      response.json(uploadKey)
    })
}
