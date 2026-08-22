<template>
  <div ref="container" class="univer-container" />
</template>

<script setup lang="ts">
import {
  Univer,
  UniverInstanceType,
  Workbook,
  LocaleType,
  IWorkbookData,
  ICommandService,
  CommandType
} from "@univerjs/core";
import { defaultTheme } from "@univerjs/design";
import { UniverDocsPlugin } from "@univerjs/docs";
import { UniverDocsUIPlugin } from "@univerjs/docs-ui";
import { UniverFormulaEnginePlugin } from "@univerjs/engine-formula";
import { UniverRenderEnginePlugin } from "@univerjs/engine-render";
import { UniverSheetsPlugin } from "@univerjs/sheets";
import { UniverSheetsFormulaPlugin } from "@univerjs/sheets-formula";
import { UniverSheetsFormulaUIPlugin } from "@univerjs/sheets-formula-ui";
import { UniverSheetsUIPlugin } from "@univerjs/sheets-ui";
import { UniverUIPlugin } from "@univerjs/ui";
import { onBeforeUnmount, onMounted, ref, toRaw, type IDisposable } from "vue";

import { zhCN, enUS } from 'univer:locales';

const props = defineProps({
  // Workbook data structure
  data: {
    type: Object as () => Partial<IWorkbookData>,
    default: () => ({}),
  },
});

const emit = defineEmits(['change', 'dirty']);

const univerRef = ref<Univer | null>(null);
const workbook = ref<Workbook | null>(null);
const container = ref<HTMLElement | null>(null);
const isDirty = ref(false);

let commandDisposable: IDisposable | null = null;

onMounted(() => {
  init(props.data);
});

onBeforeUnmount(() => {
  destroyUniver();
});

/**
 * Initialize Univer instance, plugins, and workbook model
 */
const init = (workbookData = {}) => {
  const univer = new Univer({
    theme: defaultTheme,
    locale: LocaleType.EN_US,
    locales: {
      [LocaleType.ZH_CN]: zhCN,
      [LocaleType.EN_US]: enUS,
    },
  });

  univerRef.value = univer;

  // Core Plugins
  univer.registerPlugin(UniverRenderEnginePlugin);
  univer.registerPlugin(UniverFormulaEnginePlugin);
  univer.registerPlugin(UniverUIPlugin, {
    container: container.value!,
  });

  // Document Plugins
  univer.registerPlugin(UniverDocsPlugin, {
    hasScroll: false,
  });
  univer.registerPlugin(UniverDocsUIPlugin);

  // Sheet Plugins
  univer.registerPlugin(UniverSheetsPlugin);
  univer.registerPlugin(UniverSheetsUIPlugin);
  univer.registerPlugin(UniverSheetsFormulaPlugin);
  univer.registerPlugin(UniverSheetsFormulaUIPlugin);

  // Create Unit/Workbook
  workbook.value = univer.createUnit<IWorkbookData, Workbook>(
      UniverInstanceType.UNIVER_SHEET,
      workbookData
  );

  // Setup ICommandService to track changes and dirty state
  setupCommandListener(univer);
};

/**
 * Set up listener for command execution to track true data mutations
 */
const setupCommandListener = (univerInstance: Univer) => {
  // Access ICommandService from Univer Dependency Injector
  const commandService = univerInstance.__getInjector().get(ICommandService);

  commandDisposable = commandService.onCommandExecuted((command) => {
    // Skip purely selection, cursor, scroll, or UI focus operations
    if (
        command.id.includes('selection') ||
        command.id.includes('scroll') ||
        command.id.includes('focus')
    ) {
      return;
    }

    // Flag dirty state on MUTATION type operations (data/cell/style modifications)
    if (command.type === CommandType.MUTATION || command.id.includes('mutation')) {
      if (!isDirty.value) {
        isDirty.value = true;
        emit('dirty', true);
      }
      emit('change', command);
    }
  });
};

/**
 * Destroy Univer instance, command listeners, and free memory
 */
const destroyUniver = () => {
  if (commandDisposable) {
    commandDisposable.dispose();
    commandDisposable = null;
  }

  if (univerRef.value) {
    toRaw(univerRef.value).dispose();
    univerRef.value = null;
    workbook.value = null;
  }
};

/**
 * Extract complete IWorkbookData snapshot payload
 */
const getData = () => {
  const rawWorkbook = toRaw(workbook.value);
  if (!rawWorkbook) {
    throw new Error('Workbook is not initialized');
  }
  return rawWorkbook.save();
};

/**
 * Reset dirty flag state (call after successfully saving to backend)
 */
const markClean = () => {
  isDirty.value = false;
  emit('dirty', false);
};

/**
 * Force set dirty flag state
 */
const markDirty = () => {
  isDirty.value = true;
  emit('dirty', true);
};

// Expose public state and methods to parent ref
defineExpose({
  getData,
  destroyUniver,
  isDirty,
  markClean,
  markDirty
});
</script>

<style scoped>
.univer-container {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

/* Hide navigation menubar if required */
:global(.univer-menubar) {
  display: none;
}
</style>