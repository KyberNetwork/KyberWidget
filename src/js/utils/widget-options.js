

export function onClose(){
    console.log("close")
    if (window.kyberWidgetOptions && window.kyberWidgetOptions.onClose){
        window.kyberWidgetOptions.onClose()
    }else{
        window.close()
    }
}