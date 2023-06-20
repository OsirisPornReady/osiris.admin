import { trigger, state, style, animate, transition, keyframes } from "@angular/animations";

export const slideDown = trigger('slide-down',[

  state('origin', style({ transform: "translateY(0)" })),
  state('down', style({ transform: "translateY(181px)" })),
  transition('origin => down',[ //void => *
    animate('0.45s ease-in-out')
  ]),
  transition('down => origin',[ //void => *

  ])

])

export const slideUp = trigger('slide-up',[

  state('origin', style({ transform: "translateY(0)" })),
  state('up', style({ transform: "translateY(-181px)" })),
  transition('origin => up',[ //void => *
    animate('0.45s ease-in-out')
  ]),
  transition('up => origin',[ //void => *

  ])
])

export const fadeInOut = trigger('fadeInOut',[

  // transition(':enter',[ //void => *
  //   animate('1s ease-in-out', style({ opacity: 1 }))
  // ]),

  transition(':leave',[ //* => void
    animate('1s ease-in-out', style({ opacity: 0 }))
  ])

])

export const slideInOut = trigger('slideInOut',[

  transition(':enter',[ //void => *
    style({ opacity: 0, transform: "translateX(120px)" }),
    animate('0.2s ease-in-out', style({ opacity: 1, transform: "translateX(0)" }))
  ]),

  transition(':leave',[ //* => void
    animate('0.1s ease-in-out', style({ opacity: 0, transform: "translateX(120px)" }))
  ])

])
