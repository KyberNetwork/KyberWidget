import classnames from 'classnames'




export function addPrefixClass(str){
    var list = str.split(" ")
    var lisPrefix = []
    for (var i = 0; i< list.length; i++){
        lisPrefix.push("kyber-widget-" + list[i])
    }
    return classnames(lisPrefix)
}