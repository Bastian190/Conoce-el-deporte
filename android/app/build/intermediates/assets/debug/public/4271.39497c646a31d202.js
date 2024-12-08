"use strict";(self.webpackChunkapp=self.webpackChunkapp||[]).push([[4271],{4271:(x,h,i)=>{i.r(h),i.d(h,{SesionUsuarioPageModule:()=>F});var p=i(177),u=i(4341),o=i(4742),c=i(5841),d=i(467),e=i(3953),m=i(8413),f=i(9967);const C=()=>["/recuperar"],M=()=>["/registro"],P=[{path:"",component:(()=>{var t;class s{constructor(n,r,g,a,U){this.alertController=n,this.toastController=r,this.router=g,this.authService=a,this.firestore=U}ngOnInit(){}validar(n,r){return null==n?(this.presentAlert(),console.log(this.password),this.result=1):null==r?(this.presentAlert(),console.log(this.password),this.result=2):this.result=3}todos(){this.validar(this.usuario,this.password),this.validarCorreo(this.usuario),3===this.result&&this.authService.signIn(this.usuario,this.password).then(()=>{console.log(this.password),this.router.navigate(["/tabs/Inicio"],{state:{usuario:this.usuario}})}).catch(n=>{this.presentAlert()})}presentAlert(){var n=this;return(0,d.A)(function*(){yield(yield n.alertController.create({header:"Alerta",message:"El usuario o contrase\xf1a no es correcto",buttons:["OK"]})).present()})()}validarCorreo(n){return 0===n.length?(this.correoAlert(),3):/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(n)?5:(this.correo2Alert(),4)}correoAlert(){var n=this;return(0,d.A)(function*(){yield(yield n.alertController.create({header:"Alerta",message:"Debe escribir un correo.",buttons:["OK"]})).present()})()}correo2Alert(){var n=this;return(0,d.A)(function*(){yield(yield n.alertController.create({header:"Alerta",message:"El correo no est\xe1 bien escrito.",buttons:["OK"]})).present()})()}}return(t=s).\u0275fac=function(n){return new(n||t)(e.rXU(o.hG),e.rXU(o.K_),e.rXU(c.Ix),e.rXU(m.u),e.rXU(f._7))},t.\u0275cmp=e.VBU({type:t,selectors:[["app-sesion-usuario"]],decls:29,vars:6,consts:[["id","todo"],["src","assets/logoo.png","alt","Logo de la aplicaci\xf3n","id","logo"],["id","formulario",1,"contenido"],[1,"titulo"],["id","iniciar"],[1,"inicio"],["lines","full"],["position","stacked"],["type","email","minlength","3","maxlength","200","placeholder","Correo electronico",3,"ngModelChange","ngModel"],["type","password","minlength","4","maxlength","50","placeholder","Tu contrase\xf1a",3,"ngModelChange","ngModel"],["expand","full","shape","round","id","ingresar",3,"click"],[3,"routerLink"]],template:function(n,r){1&n&&(e.j41(0,"ion-content",0),e.nrm(1,"img",1),e.j41(2,"ion-card",2)(3,"ion-card",3)(4,"ion-card-header")(5,"ion-title",4),e.EFF(6,"Iniciar sesi\xf3n"),e.k0s()()(),e.j41(7,"ion-card-content",5)(8,"ion-item",6)(9,"ion-label",7),e.EFF(10,"Correo electronico"),e.k0s(),e.j41(11,"ion-input",8),e.mxI("ngModelChange",function(a){return e.DH7(r.usuario,a)||(r.usuario=a),a}),e.k0s()(),e.j41(12,"ion-item",6)(13,"ion-label",7),e.EFF(14,"Contrase\xf1a"),e.k0s(),e.j41(15,"ion-input",9),e.mxI("ngModelChange",function(a){return e.DH7(r.password,a)||(r.password=a),a}),e.k0s()(),e.j41(16,"ion-row")(17,"ion-col")(18,"ion-button",10),e.bIt("click",function(){return r.todos()}),e.EFF(19,"Ingresar "),e.k0s(),e.j41(20,"ion-label"),e.EFF(21,"\xbfOlvid\xf3 su contrase\xf1a?"),e.k0s(),e.j41(22,"a",11),e.EFF(23,"Recuperar"),e.k0s(),e.nrm(24,"div"),e.j41(25,"ion-label"),e.EFF(26,"\xbfNo tiene cuenta?"),e.k0s(),e.j41(27,"a",11),e.EFF(28,"Registrarse"),e.k0s()()()()()()),2&n&&(e.R7$(11),e.R50("ngModel",r.usuario),e.R7$(4),e.R50("ngModel",r.password),e.R7$(7),e.Y8G("routerLink",e.lJ4(4,C)),e.R7$(5),e.Y8G("routerLink",e.lJ4(5,M)))},dependencies:[u.BC,u.xh,u.tU,u.vS,o.Jm,o.b_,o.I9,o.ME,o.hU,o.W9,o.$w,o.uz,o.he,o.ln,o.BC,o.Gw,o.oY,c.Wk],styles:['@charset "UTF-8";#nombre[_ngcontent-%COMP%]{color:#22487d}.new-background-color[_ngcontent-%COMP%]{--background: #000000;width:auto}#iniciar[_ngcontent-%COMP%]{color:#fff;width:auto;height:max-content;text-align:center;font-size:x-large}.inicio[_ngcontent-%COMP%]{box-shadow:0 0 0 2px #00000025;margin:10px 5px 5px}.titulo[_ngcontent-%COMP%]{box-shadow:none;margin:auto;align-items:center;font-size:x-large}.contenido[_ngcontent-%COMP%]{box-shadow:none;top:5%;border-radius:20px}#recuperar[_ngcontent-%COMP%]{text-decoration:none;color:#22487d;align-items:center;margin:auto}iframe[_ngcontent-%COMP%]{width:100%;border:none;align-self:auto;align-items:center;display:grid;place-content:center}.example-container[_ngcontent-%COMP%]   .mat-form-field[_ngcontent-%COMP%] + .mat-form-field[_ngcontent-%COMP%]{margin-left:8px}.example-right-align[_ngcontent-%COMP%]{text-align:right}input.example-right-align[_ngcontent-%COMP%]::-webkit-outer-spin-button, input.example-right-align[_ngcontent-%COMP%]::-webkit-inner-spin-button{display:none}input.example-right-align[_ngcontent-%COMP%]{-moz-appearance:textfield}ion-item[_ngcontent-%COMP%]   ion-label[_ngcontent-%COMP%]{font-size:x-large}ion-label[_ngcontent-%COMP%]{font-size:large}a[_ngcontent-%COMP%]{font-size:large}#todo[_ngcontent-%COMP%]{text-align:center}#logo[_ngcontent-%COMP%]{width:190px;margin-top:50px;border-radius:50%}#formulario[_ngcontent-%COMP%]{opacity:0;animation:_ngcontent-%COMP%_showForm 1s forwards;animation-delay:1s}@keyframes _ngcontent-%COMP%_showForm{to{opacity:1}}#logo[_ngcontent-%COMP%]{animation:_ngcontent-%COMP%_fadeIn 2s forwards}@keyframes _ngcontent-%COMP%_fadeIn{0%{opacity:0}to{opacity:1}}']}),s})()}];let O=(()=>{var t;class s{}return(t=s).\u0275fac=function(n){return new(n||t)},t.\u0275mod=e.$C({type:t}),t.\u0275inj=e.G2t({imports:[c.iI.forChild(P),c.iI]}),s})(),F=(()=>{var t;class s{}return(t=s).\u0275fac=function(n){return new(n||t)},t.\u0275mod=e.$C({type:t}),t.\u0275inj=e.G2t({imports:[p.MD,u.YN,o.bv,O]}),s})()}}]);