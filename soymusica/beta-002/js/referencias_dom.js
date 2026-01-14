//////////////////////////////////////////////////////
//                                                  //
//         REFERENCIAS GLOBALES (HEADER/MAIN)       //
//                                                  //
//////////////////////////////////////////////////////

// const img_Logo = document.querySelector('.logo');
// const lbl_Titulo_Principal = document.querySelector('.titulo h2');
const btn_Ir_Bienvenida_Principal = document.getElementById('btn_Ir_Bienvenida_Principal');
const h2_Lectura_Musical = document.getElementById('h2_Lectura_Musical');
const p_PC = document.getElementById('p_PC');

//////////////////////////////////////////////////////
//                                                  //
//         REFERENCIAS - DIV INICIO                 //
//                                                  //
//////////////////////////////////////////////////////

const div_Inicio = document.getElementById('div_inicio');
const btn_M_Libre = document.getElementById('btn_M_Libre');
const btn_Ir_Iniciar_Sesion = document.getElementById('btn_Ir_Iniciar_Sesion');
const btn_Ir_Registrar = document.getElementById('btn_Ir_Registrar');
// const lgnd_Inicio = document.getElementById('legend_inicio');
// const img_Mascota_Inicio = document.querySelector('#div_inicio .img_mascota');


//////////////////////////////////////////////////////
//                                                  //
//         REFERENCIAS - DIV login                 //
//                                                  //
//////////////////////////////////////////////////////

const div_login = document.getElementById('div_login');
const txt_Usuario_login = document.getElementById('usuario_login');
const txt_Password_login = document.getElementById('password_login');
const chk_Ver_Password_login = document.getElementById('ver_password');
const btn_login = document.getElementById('btn_login');
const a_Registrar = document.getElementById('a_Registrar');
const a_Inicio_login = document.getElementById('a_Inicio_login');


//////////////////////////////////////////////////////
//                                                  //
//         REFERENCIAS - DIV REGISTRO               //
//                                                  //
//////////////////////////////////////////////////////

const div_Registro = document.getElementById('div_registro');
const txt_Usuario_Registro = document.getElementById('usuario_registro');
const txt_Password_Registro = document.getElementById('password_registro');
const txt_Confirmar_Password_Registro = document.getElementById('confirmar_password');
const chk_Ver_Password_Registro = document.getElementById('ver_password_registro');
const chk_Aceptar_Terminos = document.getElementById('chk_aceptar');
const btn_Registrar = document.getElementById('btn_Registrar');
const a_I_Sesion = document.getElementById('a_I_Sesion');
const a_Inicio_Registrar = document.getElementById('a_Inicio_Registrar');

// Mensajes de validación
const p_Mensaje_Usuario = document.getElementById('p_Mensaje_Usuario');
const p_Mensaje_Password = document.getElementById('p_Mensaje_Password');
const p_Mensaje_Confirmar = document.getElementById('p_Mensaje_Confirmar');
// const lbl_Terminos = document.getElementById('p_terminos');


//////////////////////////////////////////////////////
//                                                  //
//         REFERENCIAS - DIV BIENVENIDA SELECCION              //
//                                                  //
//////////////////////////////////////////////////////

const div_Seleccion = document.getElementById('div_seleccion');
const p_Bienvenida = document.getElementById('p_Bienvenida');
const btn_Aprendizaje = document.getElementById('btn_Aprendizaje');
const btn_Desafio = document.getElementById('btn_Desafio');
const btn_Cerrar_Sesion = document.getElementById('btn_Cerrar_Sesion');


//////////////////////////////////////////////////////
//                                                  //
//         REFERENCIAS - DIV CLAVE                  //
//                                                  //
//////////////////////////////////////////////////////

const div_Clave = document.getElementById('div_clave');
const sel_Modo_Clave = document.getElementById('sel_Modo_Clave');
const h5_Div_Clave = document.getElementById('h5_Div_Clave');
const h2_Div_Clave = document.getElementById('h2_Div_Clave');
const legend_Clave = document.getElementById('legend_Clave');

// --- NUEVOS PANELES Y CONTROLES ---
const div_Checkbox_Seleccionar_Varios_Niveles = document.getElementById('div_Checkbox_Seleccionar_Varios_Niveles');
const chk_Seleccionar_Varios_Niveles = document.getElementById('chk_Seleccionar_Varios_Niveles');
const div_Botones_Claves = document.getElementById('div_Botones_Claves');
const div_Checkbox_Claves = document.getElementById('div_Checkbox_Claves');
const btn_Aceptar_Multiples_Claves = document.getElementById('btn_Aceptar_Multiples_Claves');

// --- BOTONES DE CLAVES (SELECCIÓN ÚNICA) ---
const btn_clave_sol_2 = document.getElementById('btn_clave_sol_2');
const btn_clave_fa_4 = document.getElementById('btn_clave_fa_4');
const btn_clave_do_3 = document.getElementById('btn_clave_do_3');
const btn_clave_do_4 = document.getElementById('btn_clave_do_4');
const btn_clave_do_1 = document.getElementById('btn_clave_do_1');
const btn_clave_do_2 = document.getElementById('btn_clave_do_2');
const btn_clave_fa_3 = document.getElementById('btn_clave_fa_3');
const btn_clave_sol_1 = document.getElementById('btn_clave_sol_1');

// --- CHECKBOXES DE CLAVES (SELECCIÓN MÚLTIPLE) ---
const chk_clave_sol_2 = document.getElementById('chk_clave_sol_2');
const chk_clave_fa_4 = document.getElementById('chk_clave_fa_4');
const chk_clave_do_3 = document.getElementById('chk_clave_do_3');
const chk_clave_do_4 = document.getElementById('chk_clave_do_4');
const chk_clave_do_1 = document.getElementById('chk_clave_do_1');
const chk_clave_do_2 = document.getElementById('chk_clave_do_2');
const chk_clave_fa_3 = document.getElementById('chk_clave_fa_3');
const chk_clave_sol_1 = document.getElementById('chk_clave_sol_1');



//////////////////////////////////////////////////////
//                                                  //
//         REFERENCIAS - DIV NIVELES                //
//                                                  //
//////////////////////////////////////////////////////

const div_Niveles = document.getElementById('div_niveles');
const h2_Div_Niveles_Clave = document.getElementById('h2_Div_Niveles_Clave');
const chk_desbloquear_niveles = document.getElementById('chk_desbloquear_niveles');
//const div_Desbloquear_Niveles = document.getElementById('div_Desbloquear_Niveles');
const div_Contenedor_Niveles = document.getElementById('div_Contenedor_Niveles');
// const div_Contenedor_Botones_Niveles = document.querySelector('.niveles-container');


//////////////////////////////////////////////////////
//                                                  //
//         REFERENCIAS - DIV JUEGO                  //
//                                                  //
//////////////////////////////////////////////////////

const div_Juego = document.getElementById('div_juego');
const h2_Div_Juego = document.getElementById('h2_Div_Juego');
const h3_Div_Juego = document.getElementById('h3_Div_Juego');
const p_Div_Juego = document.getElementById('p_Div_Juego');
const div_Listos_Ya = document.getElementById('div_Listos_Ya');

const img_Clave_Juego = document.getElementById('img_Clave_Juego');
const img_Nota_Juego = document.getElementById('img_Nota_Juego');
const img_Ultima_Imagen_Juego = document.getElementById('img_Ultima_Imagen_Juego');

const btn_Sonido = document.getElementById('btn_Sonido');

// Referencia a la barra de tiempo (usamos querySelector porque es una clase)
const div_Barra_Temporizador = document.querySelector('.barra-temporizador');

// Botones de alternativas
const btn_Alternativa_1 = document.getElementById('alternativa_1');
const btn_Alternativa_2 = document.getElementById('alternativa_2');
const btn_Alternativa_3 = document.getElementById('alternativa_3');
const btn_Alternativa_4 = document.getElementById('alternativa_4');

//////////////////////////////////////////////////////
//                                                  //
//      REFERENCIAS - POPUP DE CARGA  DEL JUEGO     //
//                                                  //
//////////////////////////////////////////////////////

const div_Popup_Carga = document.getElementById('div_Popup_Carga');
const h2_Popup_Carga_Titulo = document.getElementById('h2_Popup_Carga_Titulo');
const p_Popup_Carga_Mensaje = document.getElementById('p_Popup_Carga_Mensaje');
const div_Popup_Carga_Error_Acciones = document.getElementById('div_Popup_Carga_Error_Acciones');
const btn_Popup_Carga_Error_Aceptar = document.getElementById('btn_Popup_Carga_Error_Aceptar');


//////////////////////////////////////////////////////
//                                                  //
//      REFERENCIAS - POPUP RESULTADOS JUEGO        //
//                                                  //
//////////////////////////////////////////////////////

const div_Popup_Resultados_Juego = document.getElementById('div_Popup_Resultados_Juego');
const h2_Popup_Resultado_Titulo = document.getElementById('h2_Popup_Resultado_Titulo');
const img_Resultado_Juego = document.getElementById('img_Resultado_Juego');
const p_Resumen_Aciertos = document.getElementById('p_Resumen_Aciertos');
const p_Resumen_Errores = document.getElementById('p_Resumen_Errores');
const p_Mensaje_Final_Juego = document.getElementById('p_Mensaje_Final_Juego');
const btn_Popup_Repetir_Nivel = document.getElementById('btn_Popup_Repetir_Nivel');
const btn_Popup_Resultado_Aceptar = document.getElementById('btn_Popup_Resultado_Aceptar');




//////////////////////////////////////////////////////
//                                                  //
//      REFERENCIAS - POPUP INFORMACIÓN NIVEL       //
//                                                  //
//////////////////////////////////////////////////////

const div_Popup_Informacion_Nivel = document.getElementById('div_Popup_Informacion_Nivel');
const btn_Popup_Nivel_Cerrar = document.getElementById('btn_Popup_Nivel_Cerrar');
const h2_Popup_Nivel_Titulo = document.getElementById('h2_Popup_Nivel_Titulo');
const p_Popup_Nivel_Descripcion = document.getElementById('p_Popup_Nivel_Descripcion');
const div_Popup_Nivel_Imagenes = document.getElementById('div_Popup_Nivel_Imagenes');
const btn_Popup_Nivel_Aceptar = document.getElementById('btn_Popup_Nivel_Aceptar');
const btn_Popup_Nivel_Cancelar = document.getElementById('btn_Popup_Nivel_Cancelar');

//////////////////////////////////////////////////////
//                                                  //
//      REFERENCIAS - POPUP CONFIRMACIÓN DESAFÍO    //
//                                                  //
//////////////////////////////////////////////////////

const div_Popup_Confirmacion_Desafio = document.getElementById('div_Popup_Confirmacion_Desafio');
const btn_Popup_Desafio_Cerrar = document.getElementById('btn_Popup_Desafio_Cerrar');
const h2_Popup_Desafio_Titulo = document.getElementById('h2_Popup_Desafio_Titulo');
const p_Popup_Desafio_Mensaje = document.getElementById('p_Popup_Desafio_Mensaje');
const btn_Popup_Desafio_Aceptar = document.getElementById('btn_Popup_Desafio_Aceptar');
const btn_Popup_Desafio_Cancelar = document.getElementById('btn_Popup_Desafio_Cancelar');