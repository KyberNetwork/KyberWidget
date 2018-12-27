import classnames from 'classnames'

const prefixClass = process.env.NODE_ENV === 'production' ? "kyber_widget-" : ""

export function addPrefixClass(str){
    var list = str.split(" ")
    var lisPrefix = []
    for (var i = 0; i< list.length; i++){
        if (list[i] && list[i] !== " "){
            lisPrefix.push(prefixClass + list[i])
        }
    }
    return classnames(lisPrefix)
}
