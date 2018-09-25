
import BaseProvider from "./BaseProvider"

export default class PruneProvider extends BaseProvider {
    constructor(props) {
        super(props)
        this.rpcUrl = props.url
        this.network = props.network
        this.initContract(this.network)
    }
}
