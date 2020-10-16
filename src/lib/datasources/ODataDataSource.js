export default class ODataDataSource {
    getFilters = (props) => {
        let {filterDefs, filters} = props;
        let oDataFilters = [];
        for (let filterDef of filterDefs) {
            let value = filters[filterDef.name];
            let oDataFilterFunc = filterDef.dataSources.odata.filter;
            if (!oDataFilterFunc) continue;
            let oDataFilter = oDataFilterFunc({filterDef, value});
            if (oDataFilter === undefined) continue;
            oDataFilters.push(oDataFilter);
        }
        return oDataFilters;
    }

    searchByText = (props) => {
        const { value, callback, filter, props: {dataSource, option} } = props;
        const entityName = dataSource.entityName;
        const searchFields = dataSource.searchFields
            ? dataSource.searchFields
            : option.label
                ? [option.label]
                : null;
        if (!searchFields) return;
        const count = option.count || 20;

        let filters = [searchFields.map(k => `contains(tolower(${k}),'${value.toLowerCase()}')`).join(' or ')]
        if (filter) filters.push(filter)

        let expand = dataSource.expand ? `&$expand=${dataSource.expand.join(',')}` : '';

        fetch(`${dataSource.root}/${entityName}?$filter=${filters.join(' and ')}${expand}&$top=${count}`)
            .then(response => {
                if (!response.ok) {
                    callback({
                        '@odata.count': 0,
                        value: []
                    });
                } else {
                    response.json().then(data => callback(data))
                }
            })
    }

    getAll = (props) => {
        const { callback, filter, dataSource, option } = props;
        const entityName = dataSource.entityName;
        const count = option.count || 0;

        let filters = []
        if (filter) filters.push(filter)

        let expand = dataSource.expand ? `&$expand=${dataSource.expand.join(',')}` : '';

        fetch(`${dataSource.root}/${entityName}?${filters.length > 0 ? `$filter=${filters.join(' and ')}` : ''}${count > 0 ? `${expand}&$top=${count}` : ''}`)
            .then(response => {
                if (!response.ok) {
                    callback({
                        '@odata.count': 0,
                        value: []
                    });
                } else {
                    response.json().then(data => callback(data))
                }
            })
    }

    quoted = (value, keyType) => keyType === 'string' ? `'${value}'` : value;

    searchByKeys = (props) => {
        const { value, callback, props: {dataSource, option, keyType} } = props;
        const entityName = dataSource.entityName;
        const keyName = option.key;
        const valueArr = Array.isArray(value) ? value : [value];
        let expand = dataSource.expand ? `&$expand=${dataSource.expand.join(',')}` : '';
        fetch(`${dataSource.root}/${entityName}?$filter=${valueArr.map(k => `${keyName} eq ${this.quoted(k, keyType)}`).join(' or ')}${expand}`)
            .then(response => {
                if (!response.ok) {
                    callback({
                        '@odata.count': 0,
                        value: []
                    });
                } else {
                    response.json().then(data => callback(data))
                }
            })
    }
}

export let oDataDataSource = new ODataDataSource();