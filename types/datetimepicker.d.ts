declare module '@react-native-community/datetimepicker' {
  import type { Component } from 'react';
    import type { ViewProps } from 'react-native';

  export type DateTimePickerEvent = any;

  export interface DateTimePickerProps extends ViewProps {
    value: Date;
    mode?: 'date' | 'time' | 'datetime';
    display?: 'default' | 'spinner' | 'clock' | 'calendar';
    onChange: (event: DateTimePickerEvent, date?: Date) => void;
  }

  export default class DateTimePicker extends Component<DateTimePickerProps> {}
}


