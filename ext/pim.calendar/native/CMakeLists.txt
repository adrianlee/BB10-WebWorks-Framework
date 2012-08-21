cmake_minimum_required(VERSION 2.8)
include_directories(${CMAKE_SOURCE_DIR})
include_directories(${CMAKE_CURRENT_SOURCE_DIR}/../../../dependencies/jnext_1_0_8_3/jncore/jnext-extensions/common)
include_directories(${CMAKE_CURRENT_SOURCE_DIR}/../../../dependencies/JsonCpp/jsoncpp-src-0.5.0/include)

add_subdirectory(unitTests)

if (CMAKE_COMPILER_IS_GNUCC)
    set(CMAKE_CXX_FLAGS "-fexceptions -fPIC ${CMAKE_CXX_FLAGS}")
    set(CMAKE_C_FLAGS "-fPIC ${CMAKE_C_FLAGS}")
endif ()

set(pimCalendar_srcs
    pim_calendar_qt.cpp
    pim_calendar_js.cpp
    ../../../dependencies/JsonCpp/jsoncpp-src-0.5.0/src/lib_json/json_reader.cpp
    ../../../dependencies/JsonCpp/jsoncpp-src-0.5.0/src/lib_json/json_value.cpp
    ../../../dependencies/JsonCpp/jsoncpp-src-0.5.0/src/lib_json/json_writer.cpp
    ../../../dependencies/jnext_1_0_8_3/jncore/jnext-extensions/common/plugin.cpp
)

add_definitions(-DXP_UNIX)
add_library(pimCalendar MODULE ${pimCalendar_srcs})

if (${CMAKE_SYSTEM_PROCESSOR} STREQUAL "armle-v7")
set (BBPIM_LIB "bbpim")
endif ()

target_link_libraries(pimCalendar ${BBPIM_LIB})

set_target_properties(pimCalendar PROPERTIES PREFIX "")
