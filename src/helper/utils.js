export function wait( duration ) {
    return new Promise( resolve => setTimeout( resolve, duration * 1000 ) );
}