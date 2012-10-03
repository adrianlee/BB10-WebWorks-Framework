QNX_INCLUDE=$(QNX_TARGET)/usr/include
QNX_USR_LIB=$(QNX_TARGET)/$(CPUVARDIR)/usr/lib
QNX_LIB=$(QNX_TARGET)/$(CPUVARDIR)/lib

WEBWORKS_DIR=../../../../..

CCFLAGS+=-Werror
LDFLAGS+=-Wl,-z,defs,-s

EXTRA_LIBVPATH+=$(QNX_LIB) \
                $(QNX_USR_LIB) \
                $(QNX_USR_LIB)/qt4/lib

EXTRA_INCVPATH+=$(QNX_INCLUDE) \
                $(QNX_INCLUDE)/qt4 \
                $(QNX_INCLUDE)/qt4/Qt \
                $(QNX_INCLUDE)/qt4/QtCore \
                $(WEBWORKS_DIR)/dependencies/jnext_1_0_8_3/jncore/jnext-extensions/common \
                $(WEBWORKS_DIR)/dependencies/JsonCpp/jsoncpp-src-0.5.0/include

EXTRA_SRCVPATH+=$(WEBWORKS_DIR)/dependencies/JsonCpp/jsoncpp-src-0.5.0/src/lib_json \
                $(WEBWORKS_DIR)/dependencies/jnext_1_0_8_3/jncore/jnext-extensions/common

ifeq ($(PLUGIN),yes)
LDFLAGS+=-Wl,-L,$(WEBWORKS_DIR)/ext/json/native/$(CPU)/$(VARIANT1)/
SRCS+=$(WEBWORKS_DIR)/dependencies/jnext_1_0_8_3/jncore/jnext-extensions/common/plugin.cpp
endif

