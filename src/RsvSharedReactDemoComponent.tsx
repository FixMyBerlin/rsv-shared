export const RsvSharedReactDemoComponent = (props: any) => {
  return (
    <p>
      Hello from React <pre>{JSON.stringify(props, undefined, 2)}</pre>
    </p>
  )
}
