import { ref } from 'vue'
import { projectAuth , authPersistence , projectGoogleAuth } from '../firebase/config'

const error = ref(null)

const login_session = async (email: string, password: string) => {
	projectAuth.setPersistence(authPersistence.SESSION).then(() => {
		projectAuth.signInWithEmailAndPassword(email,password).then(res =>{
			return res;
		})
	})
  .catch((error) => {
    // Handle Errors here.
    const errorCode = error.code;
    const errorMessage = error.message;
		console.log(error);
  });
}

const login = async (email: string, password: string) => {
	error.value = null
	try {
		const res = await projectAuth.signInWithEmailAndPassword(email,password)
		error.value = null
		console.log(res)
		return res
	} catch(err: any) {
		console.log(err.message);
		error.value = err.message
	}
}

const useLogin = () => {
	return {error, login}
}

export default useLogin