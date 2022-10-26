import {Component, Vue} from 'vue-property-decorator'
import { WMSProvider, Layer } from '@deltares/fews-wms-requests'

@Component
export default class WMSMixin extends Vue {
  wmsProvider!: WMSProvider
  externalForecast: Date = new Date('invalid')
  layers: Layer[] = []

  created (): void {
    const baseUrl = this.$config.get('VUE_APP_FEWS_WEBSERVICES_URL')
    let url!: URL
    try {
      url = new URL(baseUrl)
    } catch (error) {
      if (error instanceof TypeError) {
        url = new URL(baseUrl, document.baseURI)
      }
    }
    this.wmsProvider = new WMSProvider(url.toString() + '/wms')
  }


  async getCapabilities (): Promise<void> {
    const baseUrl = this.$config.get('VUE_APP_FEWS_WEBSERVICES_URL')
    const response = await fetch(`${baseUrl}/wms?request=GetCapabilities&format=application/json&onlyHeaders=false`)
    this.layers = (await response.json()).layers
  }

  async getTimes (layers: string): Promise<Date[]> {
    const capabilities = await this.wmsProvider.getCapabilities({ layers, importFromExternalDataSource: false, onlyHeaders: false, forecastCount: 1 })
    let valueDates: Date[]
    if (capabilities.layers.length > 0 && capabilities.layers[0].times) {
      const dates = capabilities.layers[0].times.map((time) => { return new Date(time) })
      let firstValueDate = dates[0]
      let lastValueDate = dates[dates.length-1]
      if (capabilities.layers[0].firstValueTime) { firstValueDate = new Date(capabilities.layers[0].firstValueTime) }
      if (capabilities.layers[0].lastValueTime) { lastValueDate = new Date(capabilities.layers[0].lastValueTime) }
      valueDates = dates.filter(d => d >= firstValueDate && d <= lastValueDate)
      if (capabilities.layers[0].keywordList && capabilities.layers[0].keywordList[0].forecastTime) {
          this.externalForecast = new Date(capabilities.layers[0].keywordList[0].forecastTime)
      }
    } else {
      valueDates = []
      this.externalForecast = new Date('invalid')
      return Promise.reject(new Error('No forecast for selected layer'))
    }
    return valueDates
  }

  async getLegendGraphic (layers: string): Promise<any> {
    return await this.wmsProvider.getLegendGraphic({layers})
  }
}
