set(TARGET_NAME gpu)
AUTOSCRIBE_SHADER_LIB(gpu)
setup_hifi_library()
link_hifi_libraries(shared gl)

target_glew()
target_opengl()