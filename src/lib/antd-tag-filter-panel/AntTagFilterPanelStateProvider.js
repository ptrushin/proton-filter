export default class AntTagFilterPanelStateProvider {
    constructor(props) {
        this.props = props;
        const { api } = props;
        this.protonStateApi = null;
        this.api = api;
        let currentOnChange = this.api.onChangeEvent;
        this.api.onChangeEvent = (props) => {
            this.onFilterChanged(props);
            if (currentOnChange) currentOnChange(props);
        }
    }
    getFilterDefs = () => {
        return this.api.props.filterDefs.map(filterDef => {
            return {
                provider: this,
                ...filterDef,
                ...(this.props.filterDefs || {})[filterDef.name]
            }
        });
    }
    onFilterChanged = (props) => {
        let {filters} = props;
        this.protonStateApi.changeState({
            filters: filters
        });
    }
    getState = () => {
        return {
            filters: this.api.state.filterValues
        };
    }
    changeState = (props) => {
        let { filters } = props;
        let providerFilters = {};
        for (let name in filters) {
            let value = filters[name];
            let filterDef = this.api.getFullFilterDefByName(name);
            if (!filterDef) continue;
            providerFilters[name] = value;
        }
        this.api.setState({filterValues: providerFilters})
    }
    serialize = (value) => {
        return !value
            ? null
            : JSON.stringify(value);
    }
    deserialize = (value) => {
        return JSON.parse(value);
    }
}