import classnames from 'classnames'



const prefixClass = process.env.NODE_ENV === 'production' ? "kyber-widget-":""
export function addPrefixClass(str){
    //var prefixClass = window.KyberWidgetBuild === true ? "kyber-widget-" : ""
    var list = str.split(" ")
    var lisPrefix = []
    for (var i = 0; i< list.length; i++){
        if (list[i] && list[i] !== " "){
            lisPrefix.push(prefixClass + list[i])
        }
    }
    return classnames(lisPrefix)
}